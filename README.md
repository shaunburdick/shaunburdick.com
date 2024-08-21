# ShaunBurdick.com

![Deploy](https://github.com/shaunburdick/shaunburdick.com/actions/workflows/deploy.yml/badge.svg)
![Docker](https://github.com/shaunburdick/shaunburdick.com/actions/workflows/docker.yml/badge.svg)

My Personal Website and Playground for various technologies and ideas I wish to play with.

## Current Iteration

My goal was to poke around a little with the most basic CSS I could. Initially I considered a site with zero styling.

The question I was trying to answer:
> "Can you make a reactive, accessible site with no style?"

The answer is, maybe? You can make a somewhat useable site with no style but you are very limited.
You're also at the whim of the browser you're using with increasing variability on components.

Instead, I went with with [New.css](https://github.com/xz/new.css) which tries to be a classless framework.

It's fast and doesn't pollute the DOM with classes and wrappers. It allowed me to build a decent site with little wrapping for the sake of CSS classes.

### Why a console?

After playing with the basic site for a while, I spent a lot of time in the web console making changes on the fly. It inspired me to wonder: "How easy is it to put a console right in the page?"

I went with an effort to replicate a basic bash terminal. I tried React from scratch for the first time as well. I wanted an excuse to make it interactive and also a place to hide easter eggs.

### Wait? Easter Eggs?

Yep, there are quite a few hidden throughout the site. There are secret commands and events triggers by normal commands with specific options. Try to find some (without reading the source!)

### How do you make this accessible?

That's a very good question. I didn't want accessibility to drive features. I'd like to think features should be accessible by nature. The reality is, they're not. I tried to add as much accessibility markup as I could. I used a screen reader to use the app and learned a lot. I wouldn't say the site is truly accessible, at least not to my standards. It's something I will continue to work on, I am still considering how you make an interactive console usable for someone with visual impairments and needs for audio cues.
