const fs = require('fs');

const sites = require('./sites.json');
const today = new Date().toISOString().split('T')[0];

const site = sites.blogs[Math.floor(Math.random() * sites.blogs.length)];
sites.dates[today] = site;

fs.writeFileSync('./sites.json', JSON.stringify(sites, null, 2));

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// get meta desc
const cheerio = require('cheerio');

fetch(`https://${site}`)
    .then(res => res.text())
    .then(html => {
        const $ = cheerio.load(html);
        // TODO fix scope that populates desc
        const desc = $('meta[name="description"]').attr('content');
        
        const feed = `
            <rss version="2.0">
            <channel>
            <title>Blog of the Day</title>
            <link>https://blogofthe.day</link>
            <description>Blog of the Day</description>
            <language>en</language>
            <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
            <pubDate>${new Date().toUTCString()}</pubDate>
            ${Object.entries(sites.dates).map(([date, blog]) => `
            <item>
                <title>${blog}</title>
                <link>https://${blog}</link>
                <guid isPermaLink="true">https://${blog}</guid>
                <pubDate>${new Date(date).toUTCString()}</pubDate>
                <description>${desc || ''}</description>
            </item>
            `).join('')}
            </channel>
            </rss>
            `;

            fs.writeFileSync('./feed.xml', feed);
    });