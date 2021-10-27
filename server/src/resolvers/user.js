const userResolver = {
    Query: {
        users: (parent, args, {db}) => Object.values(db.users), // schema\user.js 에서 배열로 반환한다고 정의했으므로 .
        user: (parent, {id}, {db}) => db.users[id]
    }
}

export default userResolver