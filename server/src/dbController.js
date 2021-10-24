import fs from 'fs'
import {resolve} from 'path'

const basePath = resolve()

const filenames = {
    messages: resolve(basePath, 'src/db/messages.json'),
    users: resolve(basePath, 'src/db/users.json')
}

export const readDB = target => {
    try {
        // json 문법으로 읽어올 것이므로 js 문법으로 parsing
        return JSON.parse(fs.readFileSync(filenames[target], 'utf-8'))
    } catch (e) {
        console.error(e)
    }
}

export const writeDB = (target, data) => {
    try {
        return fs.writeFileSync(filenames[target], JSON.stringify(data))
    } catch (e) {
        console.error(e)
    }
}