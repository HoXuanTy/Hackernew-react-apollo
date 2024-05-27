import { useState } from 'react'

function Search() {
    const [searchFilter, setSearchFilter] = useState('');

  return (
    <div>
        <label>Search</label>
        <input 
            type='text'
            className="ma2"
            onChange={(e) => setSearchFilter(e.target.value)}
        />
        <button type="button">OK</button>
    </div>
  )
}

export default Search