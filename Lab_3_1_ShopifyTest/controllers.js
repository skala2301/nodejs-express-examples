require('@shopify/shopify-api/adapters/node'); // Import the Node.js adapter
const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
const http = require('http');
const { URL } = require('url');  // Destructure to directly use URL
const dotenv = require('dotenv');
const axios = require('axios');  // Import axios for HTTP requests

const products = [
  {
    product: {
      title: "Ocean Blue Shirt",
      body_html: "Ocean blue cotton shirt with a narrow collar and buttons down the front and long sleeves. Comfortable fit and tiled kalidoscope patterns.",
      vendor: "partners-demo",
      product_type: "men",
      tags: "shirt, blue, cotton",
      published: true,
      variants: [
        {
          option1: "Default Title",
          price: "50.00",
          sku: "ocean-blue-shirt-001",
          grams: 0,
          inventory_quantity: 10,
          inventory_policy: "deny",
          fulfillment_service: "manual",
          requires_shipping: true,
          taxable: true
        }
      ],
      images: [
        {
          src: "https://burst.shopifycdn.com/photos/young-man-in-bright-fashion_925x.jpg"
        }
      ]
    }
  },
  {
    product: {
      title: "Classic Varsity Top",
      body_html: "Womens casual varsity top, This grey and black buttoned top is a sport-inspired piece complete with an embroidered letter.",
      vendor: "partners-demo",
      product_type: "women",
      tags: "top, varsity, casual",
      published: true,
      variants: [
        {
          option1: "Small",
          price: "60.00",
          sku: "classic-varsity-top-small",
          grams: 0,
          inventory_quantity: 5,
          inventory_policy: "deny",
          fulfillment_service: "manual",
          requires_shipping: true,
          taxable: true
        },
        {
          option1: "Medium",
          price: "60.00",
          sku: "classic-varsity-top-medium",
          grams: 0,
          inventory_quantity: 5,
          inventory_policy: "deny",
          fulfillment_service: "manual",
          requires_shipping: true,
          taxable: true
        },
        {
          option1: "Large",
          price: "60.00",
          sku: "classic-varsity-top-large",
          grams: 0,
          inventory_quantity: 5,
          inventory_policy: "deny",
          fulfillment_service: "manual",
          requires_shipping: true,
          taxable: true
        }
      ],
      images: [
        {
          src: "https://burst.shopifycdn.com/photos/casual-fashion-woman_925xxx.jpg"
        }
      ]
    }
  },
  {
    product: {
      title: "Yellow Wool Jumper",
      body_html: "Knitted jumper in a soft wool blend with low dropped shoulders and wide sleeves and thick cuffs. Perfect for keeping warm during Fall.",
      vendor: "partners-demo",
      product_type: "women",
      tags: "jumper, wool, fall",
      published: true,
      variants: [
        {
          option1: "Default Title",
          price: "80.00",
          sku: "yellow-wool-jumper-001",
          grams: 0,
          inventory_quantity: 10,
          inventory_policy: "deny",
          fulfillment_service: "manual",
          requires_shipping: true,
          taxable: true
        }
      ],
      images: [
        {
          src: "https://burst.shopifycdn.com/photos/autumn-photographer-taking-picture_925x.jpg"
        }
      ]
    }
  },
  {
    product: {
      title: "Floral White Top",
      body_html: "Stylish sleeveless white top with a floral pattern.",
      vendor: "partners-demo",
      product_type: "women",
      tags: "top, floral, white",
      published: true,
      variants: [
        {
          option1: "Default Title",
          price: "75.00",
          sku: "floral-white-top-001",
          grams: 0,
          inventory_quantity: 5,
          inventory_policy: "deny",
          fulfillment_service: "manual",
          requires_shipping: true,
          taxable: true
        }
      ],
      images: [
        {
          src: "https://burst.shopifycdn.com/photos/city-woman-fashion_925x@2x.jpg"
        }
      ]
    }
  }
  // Add more products similarly...
];


dotenv.config();

// Shopify API Config
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: '4131-168-243-234-38.ngrok-free.app',  // Make sure your ngrok URL is correct
  apiVersion: LATEST_API_VERSION,
});

const server = http.createServer(async (req, res) => {
  const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`);
  
  if (pathname === '/auth') {
    // Step 1: Redirect the user to Shopify's OAuth page
    const shop = searchParams.get('shop');
    if (!shop) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing shop parameter' }));
      return;
    }

    const authURL = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${process.env.SHOPIFY_SCOPES}&redirect_uri=${process.env.SHOPIFY_REDIRECT_URI}&state=secure_random_string`;

    res.writeHead(302, { Location: authURL });
    res.end();
  } 

  else if (pathname === '/auth/callback') {
    // Step 2: Exchange the authorization code for an access token
    const shop = searchParams.get('shop');
    const code = searchParams.get('code');
    if (!shop || !code) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing required parameters' }));
      return;
    }

    try {
      
      const tokenResponse = await axios.post(`https://${shop}/admin/oauth/access_token`, {
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code,
      });
    
      const accessToken = tokenResponse.data.access_token;
      console.log(`Access Token: ${accessToken}`);
    
      // Save this token securely (Database or ENV)
      process.env.SHOPIFY_ACCESS_TOKEN = accessToken; // Temporarily store it in ENV for later use
    
      // await createProducts(); // Now you can use this access token to create products
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Products created successfully!' }));
    } catch (error) {
      console.error('Error getting access token:', error.response?.data || error.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to retrieve access token' }));
    }
  } 
  else if (pathname === '/add/product') {
    // Trigger product creation when visiting /add/product
    try {
      await createProducts(); // Call the function to create products
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Products created successfully!' }));
    } catch (error) {
      console.error('Error creating products:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to create products' }));
    }
  }

  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

async function createProducts() {
  console.log("URL: ",process.env.SHOPIFY_STORE_URL," SHOPIFY_ACCESS_TOKEN: ",process.env.SHOPIFY_ACCESS_TOKEN, " VERSION: ", LATEST_API_VERSION);
  for (const productData of products) {
    try {
      const response = await axios.post(
        `https://${process.env.SHOPIFY_STORE_URL}/admin/api/${LATEST_API_VERSION}/products.json`,
        productData,
        {
          headers: {
            'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Product Created:', response.data.product.title);
    } catch (error) {
      console.error('Error creating product:', error.response?.data || error.message);
    }
  }
}

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
