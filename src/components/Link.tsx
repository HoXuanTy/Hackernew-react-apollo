
import { useMutation } from "@apollo/client";

import LinkListProps from "../types/LinkList";
import { VOTE_MUTATION } from "../graphql/mutations";
import timeDifferenceForDay from "../utils/TimeDifferenceForDay";
import { FEED_QUERY } from "../graphql/query";
import { AUTH_TOKEN } from "../constans";
import QuadraticEquation from "../utils/QuadraticEquation";

const Link = (props: LinkListProps) => {
  const { link } = props;
  const authToken = localStorage.getItem(AUTH_TOKEN);

  const [vote] = useMutation(VOTE_MUTATION, {
    variables: {
      linkId: link.id,
    }
  });

  return (
    <div className="flex mt2 items-start">
      <div className="flex items-center tr">
        <span className="gray ">{props.index + 1}.</span>
        {authToken && (
          <div
            className="gray f11 ml1"
            style={{ cursor: "pointer" }}
            onClick={() => vote({
              refetchQueries: [FEED_QUERY],
            })}
          >
            ▲
          </div>
        )}
      </div>
      <div className="ml1">
        <div>
          {link.description}
          <span className="ml1 gray f7">({link.url})</span>
        </div>
        <div className="gray f7 ">
          {link.votes.length} votes | by{" "}
          {link.postedBy ? link.postedBy.name : "unknown"} {" "}
          {timeDifferenceForDay(link.createdAt)}
        </div>
      </div>
    </div>
  );
};

export default Link;
