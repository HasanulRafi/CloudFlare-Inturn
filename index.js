// API Url to keep code short and sweet
const API_URL = 'https://cfw-takehome.developers.workers.dev/api/variants'

// Global variable to store current variant
let variant
// HTML Rewriter instance
const Handler = new HTMLRewriter()

// Class to handle element manipulation
class ElementHandler {
  element(e) {
    switch(e.tagName) {
      case 'h1':
      case 'title':
        e.setInnerContent(`Cloudflare Test ${!variant ? '1' : '2'}`)
        break;
      case 'p':
        e.setInnerContent(`Welcome to the ${!variant ? 'first' : 'second'} variant!`)
        break;
      case 'a':
        e.setInnerContent('Visit my website!')
        e.setAttribute('href', 'https://pyxel.pro')
    }
  }
}

// Element handler for element manipulation
const Element = new ElementHandler()
// Pass all element handlers to the custom class
Handler.on('title', Element)
Handler.on('h1#title', Element)
Handler.on('p#description', Element)
Handler.on('a#url', Element)
// Listen for the fetch event and pass it to the handle request function
addEventListener('fetch', e => e.respondWith(handleRequest(e.request)))

// Handle all requests here
async function handleRequest(request) {
  // Get cookies from request headers
  const cookies = getCookieObject(request.headers)
  // Decide which variant URL to use
  if(cookies.hasOwnProperty('variant')) variant = parseInt(cookies.variant)
  else variant = Math.random() >= 0.5 ? 0 : 1
  // Fetch the variant urls from the takehome api
  const {variants} = await fetch(API_URL).then(res => res.json())
  // Fetch the url for the page to display from the api
  const {url} = await fetch(variants[variant])
  // Craft a response containing the HTML
  const response = new Response(await fetch(url).then(res => res.text()))
  // Set the correct Content-Type header in a clean fashion
  response.headers.set('Content-Type', 'text/html')
  // Set the variant cookie if no specific variant is set
  if(!cookies.hasOwnProperty('variant')) response.headers.set('Set-Cookie', `variant=${variant}`)
  // Transform the HTML with the Rewriter and return it
  return Handler.transform(response)
}

// Function to get cookies in object format
function getCookieObject(headers) {
  // Object for cookie storage
  const cookieObject = {}
  // Get cookies from header string
  const cookieHeader = headers.get('Cookie')
  // Check if there are any cookies
  if(cookieHeader) {
    // Loop through all cookies
    for(const cookieString of cookieHeader.split('; ')) {
      // Split and create object key:value pair
      const cookie = cookieString.split('=')
      cookieObject[cookie[0]] = cookie[1]
    }
    // Return cookie object
    return cookieObject
  // If no cookies, return empty object
  } else return {}
}
