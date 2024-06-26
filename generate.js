const fs = require('fs');

const sites = require('./sites.json');
const dates = require('./dates.json');
const httpSites = require('./http-sites.json');
const today = new Date().toISOString().split('T')[0];
const numberOfSites = sites.blogs.length;
const maxNumberOfDates = numberOfSites * 2;

let updateFeedXml = true;

// log the number of unique sites in a sentence
const uniqueSites = new Set(Object.values(sites.blogs));
console.log(`There are ${uniqueSites.size} unique sites in the feed.`);

// long the number of dates in a sentence
const numberOfDates = Object.keys(dates.dates).length;
console.log(`There are ${numberOfDates} dates in the feed.`);

// if today is in dates.json, do not generate a new one
if (dates.dates[today]) {
    const site = dates.dates[today];
    console.log(`Today's blog is already set. It's ${site}`);
    if (httpSites.sites.includes(site)) {
        console.log(`The site ${site} uses http. We will rebuild`);
        updateFeedXml = true;
    } else {
        updateFeedXml = false;
    }

} else {

    const sitesInThePastWeek = new Set(Object.values(dates.dates));
    const sitesNotInPastWeek = sites.blogs.filter(site => !sitesInThePastWeek.has(site));
    // As time goes on need an accurate restrictor. random number generators are not respectful
    // of human beings notions of fairness
    const last7Days = new Array(7).fill(0).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
    });
    const sitesInLast7Days = last7Days.map(date => dates.dates[date]);
    const sitesNotInLast7Days = sites.blogs.filter(site => !sitesInLast7Days.includes(site));
    const sitesNotInPastWeekOrLast7Days = sitesNotInPastWeek.filter(site => sitesNotInLast7Days.includes(site));

    console.log(`Sites not in the past week or last 7 days: ${sitesNotInPastWeekOrLast7Days.length}`)
    if (sitesNotInPastWeekOrLast7Days.length === 0) {
        // just choose a random site anyway, we need more indie web sites!
        dates.dates[today] = sites.blogs[Math.floor(Math.random() * sites.blogs.length)];
    } else {
        dates.dates[today] = sitesNotInPastWeekOrLast7Days[Math.floor(Math.random() * sitesNotInPastWeekOrLast7Days.length)];
    }


// remove the oldest date if we have more than maxNumberOfDates
    const datesArray = Object.keys(dates.dates);
    if (datesArray.length > maxNumberOfDates) {
        const oldestDate = datesArray.sort((a, b) => new Date(a) - new Date(b))[0];
        delete dates.dates[oldestDate];
    }
}

// check that the dates file includes the last 100 days and fill in dates that don't exist

const last100Days = new Array(maxNumberOfDates).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
});


// sort the dates in reverse order to write it out
const sortedDates = Object.keys(dates.dates).sort((a, b) => new Date(b) - new Date(a));
const sortedDatesObject = {};
sortedDates.forEach(date => {
    sortedDatesObject[date] = dates.dates[date];
});

fs.writeFileSync('./dates.json', JSON.stringify({dates: sortedDatesObject}, null, 2));

const fetch = (...args) =>
    import('node-fetch').then(({default: fetch}) => fetch(...args));

// get meta desc
const cheerio = require('cheerio');

// populate descriptions
sites.blogs.forEach(site => {
    // log whether the site has a description
    const hasDescriptionKey = sites.descriptions.hasOwnProperty(site);
    const hasDescription = sites.descriptions[site] && sites.descriptions[site].length > 0;
    const protocol = httpSites.sites.includes(site) ? 'http://' : 'https://';

    if (!hasDescriptionKey) {
        console.log(`Fetching description for ${site}.`);
        fetch(`${protocol}${site}`)
            .then(res => res.text())
            .then(html => {
                const $ = cheerio.load(html);
                const desc = $('meta[name="description"]').attr('content');
                sites.descriptions[site] = desc || "";
                fs.writeFileSync('./sites.json', JSON.stringify(sites, null, 2));
            });
    }
});

// populate the rss feed
// iterate over the dates object and create an rss feed and write to feed.xml

if (!updateFeedXml) {
    return;
}
const RSS = require('rss');
const feed = new RSS({
    title: 'Blog of the .Day',
    feed_url: 'https://blogofthe.day/feed.xml',
    site_url: 'https://blogofthe.day',
    description: 'Blog of the .Day'
});

Object.keys(dates.dates).forEach(date => {
    const site = dates.dates[date];
    const sites = require('./sites.json');
    const description = sites.descriptions[site] || '';
    const protocol = httpSites.sites.includes(site) ? 'http://' : 'https://';
    feed.item({
        title: site,
        description: description,
        url: `${protocol}${site}`,
        date: date
    });
});

fs.writeFileSync('./feed.xml', feed.xml({indent: true}));
