import React from 'react';

const Link = (props) => {
  const { link } = props;
  console.log(props);
  return (
    <div>
      <div>
        {link.description} ({link.url})
      </div>
    </div>
  );
};

export default Link;