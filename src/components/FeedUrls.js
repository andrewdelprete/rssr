import React, { Component } from "react";
import PropTypes from "prop-types";

import Parser from "rss-parser";

import { Box, Flex } from "grid-styled/emotion";

const parser = new Parser();

export default class FeedUrls extends Component {
  feedField = React.createRef();

  handleSudmitFeedUrl = async e => {
    e.preventDefault();

    const { feedUrls, onSubmit } = this.props;
    const { value } = this.feedField.current;

    value.trim();

    // Make sure value is:
    // - At least one character long
    // - Doesn't already contain the URL
    if (value.length < 1 || Object.values(feedUrls).includes(value)) {
      this.feedField.current.focus();
      return;
    }

    this.feedField.current.value = "";
    this.feedField.current.focus();
    onSubmit(value);
  };

  render() {
    const { feedUrls, onSubmit, onRemove } = this.props;

    return (
      <div className="FeedUrls">
        <h2>Feeds</h2>
        <div>
          <form onSubmit={this.handleSudmitFeedUrl}>
            <Box mb={20}>
              {feedUrls.map((feed, i) => (
                <div key={feed} className="FeedUrl" onClick={() => onRemove(feed)}>
                  {feed}
                </div>
              ))}
            </Box>
            <Flex>
              <Box flex="1 1 auto">
                <input className="FeedUrls__input" placeholder="Add Feed URL" type="url" ref={this.feedField} />
              </Box>
              <Box css={{ minWidth: 50 }}>
                <button className="FeedUrls__button" type="submit">
                  +
                </button>
              </Box>
            </Flex>
          </form>
        </div>
      </div>
    );
  }
}

FeedUrls.propTypes = {
  feedUrls: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired
};
