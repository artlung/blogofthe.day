// Tool to run periodically to find sites that are only available over HTTP.
const sites = require('./sites.json');
const cheerio = require('cheerio');
const httpSites = require('./http-sites.json');

for (const blog of sites.blogs) {
    const protocol = 'https://';
    fetch(`${protocol}${blog}`)
        .then(res => res.text())
        .catch(() => {
            console.log(`Failed to load ${protocol}${blog}. Trying http...`);
            fetch(`http://${blog}`)
                .then(res => res.text())
                .then(html => {
                    const $ = cheerio.load(html);
                    if (html) {
                        console.log(`Loaded ${protocol}${blog} with http.`);
                        // is it in httpSites?
                        if (!httpSites.sites.includes(blog)) {
                            console.log(`Adding ${blog} to http-sites.json.`);
                            httpSites.sites.push(blog);
                            fs.writeFileSync('./http-sites.json', JSON.stringify(httpSites, null, 2));
                        } else {
                            console.log(`${blog} already in http-sites.json.`);
                        }
                    }

                })
        });
}
