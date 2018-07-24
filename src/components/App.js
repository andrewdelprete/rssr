import React, { Component } from "react";
import { Link } from "react-router-dom";
import Parser from "rss-parser";
import store from "store";
import Cookies from "universal-cookie";
import random from "lodash/random";
import styled from "react-emotion";
import uniqueKey from "unique-key";
import { asyncComponent } from "@jaredpalmer/after";
import sortBy from "lodash/sortBy";
import { Box, Flex } from "grid-styled/emotion";
import Helmet from "react-helmet";

import FeedUrls from "./FeedUrls";

import format from "date-fns/format";

const cookies = new Cookies();
const parser = new Parser();

export default class App extends Component {
  state = {
    feedUrls: this.props.feedUrls,
    isLoading: false,
    parsedFeeds: this.props.parsedFeeds
  };

  handleAddFeedUrl = async feedUrl => {
    let { feedUrls, parsedFeeds } = this.state;

    this.setState({ isLoading: true });

    try {
      let parsedFeed = await parser.parseURL(`https://proxy.now.sh/${feedUrl}`);

      parsedFeed.items = parsedFeed.items.map((f, i) => {
        f.feedTitle = parsedFeed.title;
        return f;
      });

      parsedFeeds = sortBy([...parsedFeeds, ...parsedFeed.items], ["isoDate"]).reverse();
      feedUrls.push(feedUrl);

      cookies.set("feedUrls", Object.values(feedUrls).join(","));
    } catch (e) {
      alert("Something is wrong with the URL you provided.");
    }

    // 💩 fake latency
    setTimeout(() => this.setState({ feedUrls, parsedFeeds, isLoading: false }), 500);
  };

  handleRemoveFeedUrl = async feed => {
    let { feedUrls, parsedFeeds } = this.state;
    this.setState({ isLoading: true });

    try {
      feedUrls = feedUrls.filter(f => f !== feed);

      parsedFeeds = await Promise.all(feedUrls.map(f => parser.parseURL(`https://proxy.now.sh/${f}`)));

      parsedFeeds = parsedFeeds.map((f, i) => {
        f.items.map(f2 => {
          f2.feedTitle = f.title;
          return f2;
        });
        return f;
      });

      parsedFeeds = sortBy(parsedFeeds.map(f => f.items).reduce((a, b) => a.concat(b), []), ["isoDate"]).reverse();

      cookies.set("feedUrls", Object.values(feedUrls).join(","));
    } catch (e) {
      alert("Something is wrong with the URL you provided.");
    }

    setTimeout(() => this.setState({ feedUrls, parsedFeeds, isLoading: false }), 500);
  };

  render() {
    let { feedUrls, parsedFeeds, isLoading } = this.state;

    return (
      <Flex>
        <Helmet>
          <title>RSSR</title>
        </Helmet>
        <Box className="sidebar" width={[1, 1 / 4]} p={30}>
          <h1>RSSR</h1>
          <FeedUrls feedUrls={feedUrls} onRemove={this.handleRemoveFeedUrl} onSubmit={this.handleAddFeedUrl} />
        </Box>
        {isLoading ? (
          <Box className="Loader" width={[1, 3 / 4]}>
            🦄
          </Box>
        ) : (
          <Box width={[1, 3 / 4]} className="Feed">
            {parsedFeeds.length > 0 ? (
              parsedFeeds.map(feed => (
                <div className="FeedItem" key={feed.guid} style={{}}>
                  <div className="FeedItem__titleAndDate">
                    <span className="FeedItem__feedTitle">{feed.feedTitle}</span>
                    <span className="FeedItem__date"> | {format(feed.pubDate, "MMMM D, YYYY - h:ssa")}</span>
                  </div>
                  <h2 className="FeedItem__heading">
                    <a href={feed.link}>{feed.title}</a>
                  </h2>
                  <div className="FeedItem__text">{feed.contentSnippet}</div>
                </div>
              ))
            ) : (
              <div>No feeds, please add one.</div>
            )}
          </Box>
        )}
      </Flex>
    );
  }
}

App.getInitialProps = async ({ req, res, match, feedUrls }) => {
  feedUrls = feedUrls.length > 1 ? feedUrls.split(",") : [feedUrls];

  try {
    let parsedFeeds = await Promise.all(feedUrls.map(f => parser.parseURL(f)));

    parsedFeeds = parsedFeeds.map((f, i) => {
      f.items.map(f2 => {
        f2.feedTitle = f.title;
        return f2;
      });
      return f;
    });

    parsedFeeds = sortBy(parsedFeeds.map(f => f.items).reduce((a, b) => a.concat(b), []), ["isoDate"]).reverse();
    return { feedUrls, parsedFeeds };
  } catch (error) {
    console.log(error);
    // @TODO - Handle errors
    // return { error };
  }
};
