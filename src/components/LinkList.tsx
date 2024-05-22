import React from "react";

import Link from "./Link";
import LinkProps from "../types/Link";

import { useQuery } from "@apollo/client";
import { FEED_QUERY } from "../graphql/query";


const LinkList = () => {
  const { data } = useQuery(FEED_QUERY);

  return (
    <div>
      {data && (
        <>
          {data.feed.links.map((link: LinkProps, index: number) => {
            return (
            <Link key={link.id} link={link} index = {index} />
          )})}
        </>
      )}
    </div>
  );
};

export default LinkList;
