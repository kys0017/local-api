import MsgItem from "./MsgItem";
import MsgInput from "./MsgInput";
import {fetcher, QueryKeys} from "../queryClient";
import {useEffect, useRef, useState} from "react";
import {useRouter} from "next/router";
import {useQueryClient, useMutation, useQuery, useInfiniteQuery} from "react-query";
import {CREATE_MESSAGE, DELETE_MESSAGE, GET_MESSAGES, UPDATE_MESSAGE} from "../graphql/message";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

const MsgList = ({smsgs, users}) => {
    const client = useQueryClient()
    const { query } = useRouter()
    const userId = query.userId || query.userid || '';
    const [msgs, setMsgs] = useState(smsgs);
    const [editingId, setEditingId] = useState(null);

    // const [hasNext, setHasNext] = useState(true);
    const fetchMoreEl = useRef(null);
    const intersecting = useInfiniteScroll(fetchMoreEl)

    const {mutate: onCreate} = useMutation(({text}) => fetcher(CREATE_MESSAGE, {text, userId}), {
        onSuccess: ({ createMessage }) => {
            client.setQueryData(QueryKeys.MESSAGES, old => {
                return {
                    messages: [createMessage, ...old.messages]
                }
            })
        }
    })

    const {mutate: onUpdate} = useMutation(({ text, id}) => fetcher(UPDATE_MESSAGE, {text, id, userId }), {
        onSuccess: ({updateMessage}) => {
            client.setQueryData(QueryKeys.MESSAGES, old => {
                const targetIndex = old.messages.findIndex(msg => msg.id === updateMessage.id)
                if(targetIndex < 0 ) return old;
                const newMsgs = [...old.messages]
                newMsgs.splice(targetIndex, 1, updateMessage)
                return {messages: newMsgs}
            })
            doneEdit()
        }
    })

    const {mutate: onDelete} = useMutation(id => fetcher(DELETE_MESSAGE, {id, userId}), {
        onSuccess: ({deleteMessage: deletedId}) => {
            client.setQueryData(QueryKeys.MESSAGES, old => {
                const targetIndex = old.messages.findIndex(msg => msg.id === deletedId)
                if(targetIndex < 0 ) return old;
                const newMsgs = [...old.messages]
                newMsgs.splice(targetIndex, 1)
                return {messages: newMsgs}
            })
        }
    })

    const doneEdit = () => setEditingId(null)

    const { data, error, isError, fetchNextPage, hasNextPage } = useInfiniteQuery(
        QueryKeys.MESSAGES,
        ({ pageParam = ''}) => fetcher(GET_MESSAGES, {cursor: pageParam}),
        {
            getNextPageParam: ({ messages }) => {
                return messages?.[messages.length -1]?.id
            }
        }
    ) // stale: 엣 것. 미리 받아놓은 정보.

    useEffect(() => {
        if(!data?.pages) return
        console.log('msgs changed')
        // const data.pages = [ { messages: [...]}, { messages: [...]} ] => [...]
        const mergedMsgs = data.pages.flatMap(d => d.messages)
        console.log({mergedMsgs})
        setMsgs(mergedMsgs)
    }, [data?.pages]);


    if (isError) {
        console.error(error)
        return null;
    }

    useEffect(() => {
        if(intersecting && hasNextPage) fetchNextPage()
    }, [intersecting, hasNextPage]);

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
                        user={users.find(u => userId === u.id)}
                    />) }
            </ul>
            <div ref={fetchMoreEl} />
        </>
    )
}

export default MsgList