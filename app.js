/**
 * Created by vikram on 21/12/19.
 */
const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

const axios = require('axios');
const asyncMiddleware = require('./helper/asyncMiddleware');
const fs = require('fs').promises;
let endPoint = 'https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=dict.1.1.20170610T055246Z.0f11bdc42e7b693a.eefbde961e10106a4efa7d852287caa49ecc68cf&lang=en-ru&text='
const fileUrl = 'http://norvig.com/big.txt';

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/', asyncMiddleware(async(req, res)=> {
		//    Fetch url content in string variable
        let content = ''
        if (req.query.online !== undefined && req.query.online == 'true') {
        	let fileData = await axios.get(fileUrl);
        	content = fileData.data;	
        } else {
        	content =  await fs.readFile('big.txt', 'utf8');
    	}
    	if(req.query.lang !== undefined && req.query.lang.toString().trim() !== '') {
    		endPoint = endPoint.replace('lang=en-ru', `lang=${req.query.lang}`);
    	}
    	let endStr = content.indexOf('Retrieved from');
        /* Trim python code from string
			def g():
			  global big
			  big = file('big.txt').read()
			  N = len(big)
			  s = set()
			  for i in xrange(6, N):
			    c = big[i]
			    if ord(c) > 127 and c not in s:
			        print i, c, ord(c), big[max(0, i-10):min(N, i+10)]
			        s.add(c)
			  print s
			  print [ord(c) for c in s]
         */
        content = content.substring(0, endStr);
        let wordsCount = countWords(content);

        let data = [];
        let error = '';
		for(let word in wordsCount) {
			let url = endPoint + word;
			try{
				let wordResult = await axios.get(url);
				/* Structure  */
				/*
					Word: text 
					Output 
					Count of Occurrence in that Particular Document
					Synonyms
					Pos

				*/
				wordResult = wordResult.data.def;
				if (wordResult.length) {
					let node = {};
					node['word'] = word;
					let synPos = getSynPos(wordResult); 
					node['Synonyms'] = synPos.synonyms;
					node['Count of Occurrence in that Particular Document'] = wordsCount[word];
					node['Pos'] =  synPos.pos;
					data.push(node);
				}
			} catch(e) {
				error =  e.response.data.message;
				break;
		 	}
		}
		res.render('index', {data: data, wordsCount: wordsCount, error: error});
             
}));

function countWords(str) {
   str = str.replace(/(^\s*)|(\s*$)|(\*)/gi,"");
   str = str.replace(/[ ]{2,}/gi," ");
   str = str.replace(/\n/g," ").replace(/!/g,"").replace(/-/g," ").replace(/,/g," ").replace(/{/g," ").replace(/}/g," ").replace(/}/g," ");

   let strArray = str.split(' ');
   let filterArray = [];
   let result = {};
   	for(let element of strArray) {
   		element = element.replace(/"/g, '');
   		let len = element.toString().trim().length;
   		if ( len > 0) {
   			filterArray.push(element);
   		}

   	}
   	let counts = {};
	for (let i = 0; i < filterArray.length; i++) {
	    counts[filterArray[i]] = 1 + (counts[filterArray[i]] || 0);
	}
	
	let sortable = [];
	for (let txt in counts) {
	    sortable.push([txt, counts[txt]]);
	}

	sortable.sort(function(a, b) {
	    return b[1] - a[1];
	});

	// get First top 10 words
	let obj_top_10 = {};
    let top_10_words = sortable.slice(0, 10);
    for (let tp of top_10_words) {
    	obj_top_10[tp[0]] = tp[1];
    }
    
	return obj_top_10;
}


function getSynPos(data) {
	let resultText = [];
	let resultPos = [];
	let txtData = data[0].tr;
	if (txtData.length) {
		for (let txt of txtData) {
			if (txt.syn !== undefined) {
				for (let node of txt.syn) {
					resultText.push(node.text);
					resultPos.push(node.pos);
				}
			}
			if(txt.mean !== undefined) {
				for (let node of txt.mean) {
					resultText.push(node.text);
				}
			} else {
				if (txt.text !== undefined) {
					resultText.push(txt.text);
					resultPos.push(txt.pos);
				}
			}
		}
	}
	let result = {
		synonyms: resultText.length ? resultText.filter( onlyUnique ).join(', ') : '',
		pos: resultPos.length ? resultPos.filter(onlyUnique).join(', ') : ''
	}
	return result;
}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

app.listen(port, function() {
    console.log('Example app listening on port '+ port);
});
