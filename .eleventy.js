module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy("assets/js");
    eleventyConfig.addPassthroughCopy("feed.xml");

    eleventyConfig.addShortcode("blogToday", function() {
        const fs = require('fs');
        const sites = require('./sites.json');
        const today = new Date().toISOString().split('T')[0];
        return sites.dates[today];
    });
    eleventyConfig.addShortcode("blogsByDate", function() {
        const fs = require('fs');
        const sites = require('./sites.json');
        return sites.dates;
    });
};