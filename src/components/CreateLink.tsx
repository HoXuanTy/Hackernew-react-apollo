import { useState } from 'react';

import { useMutation } from '@apollo/client';
import { CREATE_LINK_MUTATION } from '../graphql/mutations';
import { useNavigate } from 'react-router-dom';

const CreateLink = () => {
  const navigate = useNavigate()

  const [formState, setFormState] = useState({
    description: '',
    url: ''
  });

  const [createLink] = useMutation(CREATE_LINK_MUTATION, {
    variables: formState,
    onCompleted: () => navigate('/')
  })


  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createLink()
        }}
      >
        <div className="flex flex-column mt3">
          <input
            className="mb2"
            value={formState.description}
            onChange={(e) =>
              setFormState({
                ...formState,
                description: e.target.value
              })
            }
            type="text"
            placeholder="A description for the link"
          />
          <input
            className="mb2"
            value={formState.url}
            onChange={(e) =>
              setFormState({
                ...formState,
                url: e.target.value
              })
            }
            type="text"
            placeholder="The URL for the link"
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default CreateLink;