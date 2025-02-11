import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString('hex');

  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: true, 
    saveUninitialized: true, 
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, 
      httpOnly: true,
      secure: app.get("env") === "production",
      sameSite: app.get("env") === "production" ? 'strict' : 'lax'
    },
    name: 'solvix.sid'
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  
  console.log('Session Configuration:', {
    env: app.get("env"),
    cookieSecure: sessionSettings.cookie?.secure,
    cookieSameSite: sessionSettings.cookie?.sameSite,
    resave: sessionSettings.resave,
    saveUninitialized: sessionSettings.saveUninitialized
  });

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  
  app.use((req, res, next) => {
    console.log('Session State:', {
      hasSession: !!req.session,
      sessionID: req.sessionID,
      isAuthenticated: req.isAuthenticated(),
      user: req.user ? { id: req.user.id, email: req.user.email } : 'none',
      cookie: req.session?.cookie,
      headers: {
        cookie: req.headers.cookie,
        origin: req.headers.origin,
        referer: req.headers.referer
      }
    });
    next();
  });

  passport.use(
    new LocalStrategy(
      { 
        usernameField: 'email',  
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          console.log("Login attempt:", { email, hasPassword: !!password });
          const user = await storage.getUserByEmail(email);
          console.log("User lookup result:", { found: !!user, isAdmin: user?.is_admin });

          if (!user) {
            return done(null, false, { message: "Incorrect email or password" });
          }

          const isValid = await comparePasswords(password, user.password);
          console.log("Password validation:", { isValid });

          if (!isValid) {
            return done(null, false, { message: "Incorrect email or password" });
          }

          return done(null, user);
        } catch (err) {
          console.error("Login error:", err);
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    console.log("Serializing user:", { id: user.id, email: user.email });
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log("Deserializing user:", id);
      const user = await storage.getUser(id);
      console.log("Deserialization result:", { 
        found: !!user, 
        hasId: user?.id === id,
        isAdmin: user?.is_admin 
      });
      done(null, user);
    } catch (err) {
      console.error("Deserialize error:", err);
      done(err);
    }
  });

  app.get("/api/user", (req, res) => {
    console.log("User check - Full State:", {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      sessionID: req.sessionID,
      session: req.session,
      headers: {
        cookie: req.headers.cookie,
        authorization: req.headers.authorization
      }
    });

    if (!req.isAuthenticated()) {
      console.log("Authentication failed - missing or invalid session");
      return res.sendStatus(401);
    }
    res.json(req.user);
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("Register request received:", req.body);
      const existingUser = await storage.getUserByEmail(req.body.email);

      if (existingUser) {
        console.log("Email already exists");
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) {
          console.error("Login error after registration:", err);
          return next(err);
        }
        console.log("Registration successful for user:", user.id);
        return res.status(201).json(user);
      });
    } catch (err) {
      console.error("Registration error:", err);
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("Login request received:", req.body);
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Authentication error:", err);
        return next(err);
      }
      if (!user) {
        console.log("Authentication failed:", info?.message);
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.logIn(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return next(err);
        }
        console.log("Login successful for user:", user.id);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    console.log("Logout request received");
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return next(err);
      }
      console.log("Logout successful");
      res.sendStatus(200);
    });
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("Admin login attempt for:", email);

      const user = await storage.getUserByEmail(email);
      console.log("Found user:", user ? "yes" : "no", "isAdmin:", user?.is_admin);

      if (!user || !user.is_admin) {
        console.log("User not found or not admin");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await comparePasswords(password, user.password);
      console.log("Password valid:", isValid);

      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.login(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        console.log("Admin login successful");
        res.json(user);
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/check", (req, res) => {
    if (!req.isAuthenticated() || !req.user?.is_admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(req.user);
  });
}