interface LinkProps {
    id: string,
    url: string,
    description: string,
    postedBy:User,
    votes:[Vote]
}

interface Vote  {
    id: string
    users: User
}

interface User {
    id: string
    name: String
  }


export default LinkProps