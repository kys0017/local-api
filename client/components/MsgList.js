import MsgItem from "./MsgItem";
import MsgInput from "./MsgInput";
import fetcher from "../fetcher";
import {useEffect, useRef, useState} from "react";
import {useRouter} from "next/router";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

const MsgList = ({smsgs, users}) => {
    const { query } = useRouter()
    const userId = query.userId || query.userid || '';
    const fetchMoreEl = useRef(null);
    const intersecting = useInfiniteScroll(fetchMoreEl)

    const [msgs, setMsgs] = useState(smsgs);
    const [editingId, setEditingId] = useState(null);
    const [hasNext, setHasNext] = useState(true);

    const onCreate = async (text) => {
        const newMsg = await fetcher('post', '/messages', { text, userId})
        if(!newMsg) new Error('something wrong')
        setMsgs(msgs => ([newMsg, ...msgs]))
    }

    const onUpdate = async(text, id) => {
        const newMsg = await fetcher('put', `/messages/${id}`, {text, userId})
        if(!newMsg) new Error('something wrong')
        setMsgs(msgs => {
            const targetIndex = msgs.findIndex(msg => msg.id === id)
            if(targetIndex < 0 ) return msgs;
            const newMsgs = [...msgs]
            newMsgs.splice(targetIndex, 1, newMsg)
            return newMsgs
        })
        doneEdit()
    }

    const onDelete = async (id) => {
        const receivedId = await fetcher('delete', `/messages/${id}`, { params: {userId}}) // /messages/:id?userId={userId} 와 같고 서버에서는 query 로 받아야 함
        console.log(typeof receivedId, typeof id)
        setMsgs(msgs => {
            const targetIndex = msgs.findIndex(msg => msg.id === receivedId + '')
            if(targetIndex < 0 ) return msgs;
            const newMsgs = [...msgs]
            newMsgs.splice(targetIndex, 1)
            return newMsgs
        })
    }

    const doneEdit = () => setEditingId(null)

    const getMessages = async() => { // useEffect 함수에는 async 쓸 수 없음
        const newMsgs = await fetcher('get', '/messages', {params: {cursor: msgs[msgs.length -1]?.id || ''}});
        if(newMsgs.length === 0) {
            setHasNext(false)
            return
        }
        setMsgs(msgs => [ ...msgs, ...newMsgs])
    }

    useEffect(() => {
        if(intersecting && hasNext) getMessages()
    }, [intersecting]);



    return (
        <>
            {userId && <MsgInput mutate={onCreate}/> }
            <ul className="messages">
                { msgs.map(x =>
                    <MsgItem
                        key={x.id} {...x}
                        onUpdate={onUpdate}
                        onDelete={() => onDelete(x.id)}
                        startEdit={() => setEditingId(x.id)}
                        isEditing={editingId === x.id }
                        myId={userId}
                        user={users[x.userId]}
                    />) }
            </ul>
            <div ref={fetchMoreEl} />
        </>
    )
}

export default MsgList