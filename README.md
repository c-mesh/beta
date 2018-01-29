// steps to run project locally

1. Download all the files from github from Soham_bug_fixes branch
2. Save the files in the project folder: "main"
3. Terminal- cd ../main
4. Terminal- NPM Install 
5. Terminal - upadte client ID, secret, etc
6. Separate Terminal - mongod --dbpath = "../data" 
7. Terminal - NPM Run Dev 
9. Alternate terminal - mongo
10. Inside mongo shell - use test
11. browser: localhost:3000

set the following environment variables in your terminal  

LINKEDIN_CLIENT_ID=  
LINKEDIN_CLIENT_SECRET=  
CALLBACK_URL=http://localhost:3000/auth/linkedin/callback  
MONGODB_URI=mongodb://localhost/myapp  

npm install  
npm run dev


// old instructions

install all NPM packages from package.json

config/auth.js
- Line 2: need deployed link.
- Line 7 & 8: need to sign up for Linkedin API keys to get clientID & clientSecret.  

index.html
- Line 19: need to create a Google Project and enable Google Maps to get a Google Maps API key
- Line 21: bundle.js is created by webpack.js to combine all React components into one giant js file. bundle.js needs to be recreated by webpack every time any React component code is updated.  

database
- This app's server needs MongoDB to run its database.  Easiest way to do this locally is to have both "mongod" and Robo 3T running.  
