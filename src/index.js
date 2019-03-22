'use strict'

const rp = require('request-promise')
const cheerio = require('cheerio')
const saw = require('string-saw')
const pson = require('prettyjson')

// print beauty format
const print = (data) => {
    let options = {
        noColor: false,
        dashColor: 'white'
    }
    console.log(pson.render(data, options))
}

// get html body
const getWebData = async () => {
    const options = {
        uri: 'https://news.ycombinator.com/',
    }
    return await rp(options)
}

const extract = async () => {

    let data = await getWebData()

    let $ = cheerio.load(data)

    let titleRows = $('tr td.title', 'body table table > tbody').toArray().filter((e, i) => i % 2 == 1)
    let subtextRows = $('tr td.subtext', 'body table table > tbody').toArray()

    let result = []

    // map two tr rows
    for (let rowIdx = 0; rowIdx < subtextRows.length; rowIdx++) {
        let titleRow = $(titleRows[rowIdx])
        let subtextRow = $(subtextRows[rowIdx])

        let title = titleRow.find('.storylink').eq(0).text()
        let user = subtextRow.find('.hnuser').eq(0).text()
        let total_points = subtextRow.find('.score').eq(0).text()
        let total_comments = subtextRow.find('a').eq(3).text()
        let link = titleRow.find('.storylink').eq(0).attr('href')

        result.push({
            title,
            user,
            total_points: saw(total_points).remove('points').toNumber(),
            total_comments: saw(total_comments).remove('comments').toNumber(),
            link,
        })
    }

    console.log(result)
    // print(result)
}

extract()
