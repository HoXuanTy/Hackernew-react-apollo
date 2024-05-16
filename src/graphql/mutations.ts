import { gql } from '@apollo/client';

const LOGIN_MUTATION = gql`
    mutation LoginMutation($email: String! $password: String!) {
        login(email: $email, password: $password){
            token
        }
    }
`
const SIGNUP_MUTATION = gql`
    mutation SignupMutation($email: String! $password: String! $name: String!) {
        signup(email: $email, password: $password, name: $name) {
            token
        }
    }
`
const CREATE_LINK_MUTATION = gql`
  mutation PostMutation(
    $description: String!
    $url: String!
  ) {
    post(description: $description, url: $url) {
      id
      createdAt
      url
      description
    }
  }
`;

const VOTE_MUTATION = gql`
  mutation VoteMutation($linkId: ID!) {
    vote(linkId: $linkId) {
      id
      link {
        id
      }
      user {
        id
        name
      }
    }
  }

`

export { 
  LOGIN_MUTATION, 
  SIGNUP_MUTATION, 
  CREATE_LINK_MUTATION, 
  VOTE_MUTATION 
}
