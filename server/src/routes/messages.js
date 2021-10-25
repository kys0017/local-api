import {v4} from 'uuid'
import {readDB, writeDB} from "../dbController.js";

const getMsgs = () => readDB('messages')
const setMsgs = data => writeDB('messages', data)

const messagesRoute = [
    { // GET MESSAGES
        method: 'get',
        route: '/messages',
        handler: ({query: {cursor = ''}}, res) => {
            const msgs = getMsgs()
            const fromIndex = msgs.findIndex(msg => msg.id === cursor) + 1
            res.send(msgs.slice(fromIndex, fromIndex + 15))
        }
    },
    { // GET MESSAGE
        method: 'get',
        route: '/messages/:id',
        handler: ({params: {id}}, res) => {
            try {
                const msgs = getMsgs()
                const msg = msgs.find(m => m.id === id)
                if(!msg) throw Error('not found')
                res.send(msg)
            }catch (e) {
                res.status(404).send({error: e})
            }
        }
    },
    { // CREATE MESSAGE
        method: 'post',
        route: '/messages',
        handler: ({body}, res) => {
            try {
                if (!body.userId) throw Error('no userId')
                const msgs = getMsgs()
                const newMsg = {
                    id       : v4(),
                    text     : body.text,
                    userId   : body.userId,
                    timestamp: Date.now()
                }
                msgs.unshift(newMsg)
                setMsgs(msgs)
                res.send(newMsg)
            } catch (e) {
                res.status(500).send({error: e})
            }
        }
    },
    { // UPDATE MESSAGE
        method: 'put',
        route: '/messages/:id',
        handler: ({body, params: {id}}, res) => {
            try {
                const msgs = getMsgs()
                const targetIndex = msgs.findIndex(msg => msg.id === id)
                if(targetIndex < 0) throw '메시지가 없습니다.'
                if(msgs[targetIndex].userId !== body.userId) throw '사용자가 다릅니다.'

                const newMsg = { ...msgs[targetIndex], text: body.text }
                msgs.splice(targetIndex, 1, newMsg)
                setMsgs(msgs)
                res.send(newMsg)
            } catch (e) {
                res.status(500).send({error: e})
            }
        }
    },
    { // DELETE MESSAGE
        method: 'delete',
        route: '/messages/:id',
        handler: ({params: {id}, query: { userId}}, res) => {
            try {
                const msgs = getMsgs()
                const targetIndex = msgs.findIndex(msg => msg.id === id)
                if(targetIndex < 0) throw '메시지가 없습니다.'
                if(msgs[targetIndex].userId !== userId) throw '사용자가 다릅니다.'

                msgs.splice(targetIndex, 1)
                setMsgs(msgs)
                res.send(id)
            } catch (e) {
                res.status(500).send({error: e})
            }
        }
    },
]

export default messagesRoute