# Conversational-AI

Requirement <br>
  Node verion >= v10.4.0
  
  ### For Run the project
    - Clone the repo using command  : git clone https://github.com/vikramparihar/Conversational-AI.git
    - cd Conversational-AI
    - npm install
    - node app.js
    
    - You will see like this on terminal: Example app listening on port 3000
  
###<br>
  - Open your browser and paste the url (http://localhost:3000/)
  - You will see output like
  - ![Image of Result]
  <img src="https://i.imgur.com/DGC1ZPr.png"/>
  
###<br>
  - Optional Parameter
    - When you pass the parameter online=true like following url then content will be fetch from this url    (http://norvig.com/big.txt) real time other wise content will be fetch from same file which is save on local root directory.
  - http://localhost:3000/online=true
  
  ### Aim of the test code
    - This code snippet will fetch top 10 words based on occurance, which is used in big.txt file.
    - Fetching the related text, synonyms/means, pos of the given word using third party api call.
    - show the final output as json object.
  
    - current language en-ru
    - you can change the lang using optional parameter line http://localhost:3000/?lang=en-en
