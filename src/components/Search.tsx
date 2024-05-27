import { useState } from 'react'

import { useLazyQuery } from '@apollo/client';
import { FEED_SEARCH_QUERY } from '../graphql/query';
import Link from './Link';
import LinkProps from '../types/Link';

function Search() {
  const [searchFilter, setSearchFilter] = useState('');
  const [executeSearch, { data }] = useLazyQuery(
    FEED_SEARCH_QUERY
  );

  return (
    <div>
        <label>Search</label>
        <input 
            type='text'
            className="ma2"
            onChange={(e) => setSearchFilter(e.target.value)}
        />
        <button type="button"
          onClick={ () => 
            executeSearch({
              variables: {filter: searchFilter}
            })
          }
        >OK</button>
        {data &&
        data.feed.links.map((link: LinkProps, index: number) => (
          <Link key={link.id} link={link} index={index} />
        ))}
    </div>
  )
}

export default Search