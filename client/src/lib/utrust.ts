const UTRUST_API_URL = 'https://merchants.api.crypto.xmoney.com/api/stores/orders';

interface UtrustOrder {
  data: {
    type: 'orders';
    attributes: {
      order: {
        reference: string;
        amount: {
          total: string;
          currency: string;
          details: {
            subtotal: string;
            shipping?: string;
            tax?: string;
            discount?: string;
          };
        };
        return_urls: {
          return_url: string;
          callback_url: string;
          cancel_url: string;
        };
        line_items: Array<{
          sku: string;
          name: string;
          price: string;
          currency: string;
          quantity: number;
        }>;
      };
      customer: {
        name?: string;
        first_name: string;
        last_name: string;
        email: string;
        billing_address?: string;
        address1: string;
        address2: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
      };
    };
  };
}

interface UtrustResponse {
  data: {
    type: 'orders';
    id: string;
    attributes: {
      redirect_url: string;
      status: string;
    };
  };
}

export async function createUtrustOrder(
  amount: number,
  items: Array<{ id: string; name: string; price: number; description: string }>,
): Promise<string> {
  if (amount <= 0) {
    throw new Error('Invalid amount');
  }

  const orderRef = `order-${Date.now()}`;
  const userEmail = localStorage.getItem('userEmail') || 'guest@example.com';
  const userName = localStorage.getItem('userName') || 'Guest User';
  const domain = import.meta.env.VITE_APP_URL || window.location.origin;

  const order: UtrustOrder = {
    data: {
      type: 'orders',
      attributes: {
        order: {
          reference: orderRef,
          amount: {
            total: (amount / 100).toFixed(2),
            currency: 'USD',
            details: {
              subtotal: (amount / 100).toFixed(2)
            }
          },
          return_urls: {
            return_url: `${domain}/requirements`,
            callback_url: `${domain}/api/payments/webhook`,
            cancel_url: `${domain}/checkout`
          },
          line_items: items.map(item => ({
            sku: item.id || `SKU-${Date.now()}`,
            name: item.name,
            price: (item.price / 100).toFixed(2),
            currency: 'USD',
            quantity: 1
          }))
        },
        customer: {
          name: userName,
          first_name: '',
          last_name: '',
          email: userEmail,
          billing_address: '',
          address1: '',
          address2: '',
          city: '',
          state: '',
          postcode: '',
          country: 'US'
        }
      }
    }
  };

  try {
    console.log('Creating payment order:', JSON.stringify(order, null, 2));

    const response = await fetch('/api/payments/create-utrust-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json'
      },
      body: JSON.stringify(order)
    });

    const responseData = await response.text();
    console.log('Payment API response:', responseData);

    if (!response.ok) {
      throw new Error(responseData || 'Failed to create payment order');
    }

    const data = JSON.parse(responseData);
    if (!data.data?.attributes?.redirect_url) {
      throw new Error('Invalid response from payment provider');
    }

    return data.data.attributes.redirect_url;
  } catch (error) {
    console.error('Payment creation error:', error);
    throw error instanceof Error ? error : new Error('Failed to create payment order');
  }
}