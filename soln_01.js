const http = require('http');
const sw = require('stopwords');
const qs = require('querystring');
 function collectRequestData(request, callback){
    const FORM_URLENCODED = 'application/x-www-form-urlencoded';
    if(request.headers['content-type'] === FORM_URLENCODED) {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            callback(qs.parse(body));
            //console.log(body);
        });
    }
    else {
        callback(null);
    }
}
function sen_seg(string){
    let temp='';
    for(let i in string){
        if(string[i]=='?'||string[i]=='!')//taking care of ? and !
        {temp+='.';}
        else if(string[i]==','){//replace comma by space
            temp+=' ';
        }
        else{
        temp+=string[i];}
    }
    var out =  temp.split('.');
    if (out[out.length-1]==''){ out.pop();}
    return out;
}

function word_seg(string){
    var temp=string.split(' ');
    var out=[];
    for(let i in temp){
        if(!(temp[i]==''))
        out.push(temp[i]);
    }
    return out;
}

function remove_stopw(arr){
    let out=[];
    for (let i in arr){
        if(sw.english.includes((arr[i]).toLowerCase())){continue;}
        else{out.push(arr[i]);}
    }
    return out;
}

function remove_repeatw(arr){
    let out=[];
    for (let i in arr){
        if(!(out.includes(arr[i]))){
            out.push(arr[i]);
        }
    }
    return out;
}

function rev_word(arr){
    var out=[];
    for(let i in arr){
        temp=arr[i].split('');
        temp = temp.reverse();
        out.push(temp.join(''));
    }
    return out;
}

function numbers(arr){
    var out=[];
    for(let i in arr){
        if(!(Number.isNaN(parseInt(arr[i]))))
        out.push(parseInt(arr[i]));
    }
    return out;
}
http.createServer(function (req, res) {
    if (req.method === 'POST') {
        collectRequestData(req, result => {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(`Entered data = ${result.input}`);
            var sentences = sen_seg(result.input);
            //console.log('Sentence Segmentation\n',sentences);
            res.write('\n\n<h3>1.Sentence Segmentation - </h3>\n\n');
            res.write(objToStr(sentences));
            var words = {};
            for(let i in  sentences){
                let sent = sentences[i];
                words[sent] = word_seg(sent);//creating object with format{sentence : word_array}
            }
            //console.log('Words Segmentation-\n ',words);
            res.write('\n<h3>2.Word Segmentation - </h3>\n\n');
            res.write(objToStr(words));
            words_mod_1={};
            for(key in words){
                arr = words[key];
                words_mod_1[key] = remove_stopw(arr);
            }
            //console.log('Sentence data without stopwords - ',words_mod_1);
            res.write('\n<h3>3.Sentence data without stopwords - </h3>\n\n');
            res.write(objToStr(words_mod_1));
            words_mod_2={};
            for(key in words){
                arr = words[key];
                words_mod_2[key] = remove_repeatw(arr);
            }
            //console.log('Sentence data without repeated words - ',words_mod_2);
            res.write('\n<h3>4.Sentence data without repeated words - </h3>\n\n');
            res.write(objToStr(words_mod_2));
            //console.log('Each word reversed : ');
            res.write('\n<h3>5.Each word reversed : </h3>\n\n');
            for(key in words){
                let temp=rev_word(words[key]);
                //console.log(temp.join(' ')+'.');
                res.write(temp.join(' ')+'.\n');
            }
            
            var num={};
            for(key in words){
                num[key]=numbers(words[key]);
            }
            res.write('\n<h3>6.Numbers in each sentence :</h3>\n\n ');
            res.end('"'+objToStr(num)+'"');
        });
    }
       else{
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<body><form action = "inp_accepted" method="post">');
    res.write('<p>Enter string : </p>');
    res.write('<input name ="input" id="inp" type="text"><br>');
    res.write('<input type="submit">');
    res.write('</form></body>');
    return res.end();
  }
}).listen(8080);

function objToStr(obj){
    //return Object.entries(obj).map(x=>("'"+x.toString()+"'").join(":")).join("\n");
    return JSON.stringify(obj,null,2);
}