import { gql } from "@apollo/client";


const FEED_QUERY = gql`
  {
    feed {
      id
      links {
        id
        createdAt
        url
        description
        postedBy {
          id
          name
        }
        votes {
          id 
          user {
            id
          }
        }
      }
    }
  }
`;


export { FEED_QUERY }