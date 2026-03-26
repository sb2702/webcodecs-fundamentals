---
title: Inside Jokes 
description: Explanations of the hidden references and inside jokes throughout this site
---
This site contains a few recurring inside jokes and references which are also found in programmer / internet pop culture. Here is what they mean:

## Citation Needed

[Randall Munroe](https://en.wikipedia.org/wiki/Randall_Munroe) is the author of a popular web comic called [xkcd](https://xkcd.com) which includes particularly nerdy humour.

One recurring joke from xkcd is the citation needed meme, which originally appeared in the following comic strip on July 4th, 2007.

![Citation needed](https://imgs.xkcd.com/comics/wikipedian_protester.png)

The original comic itself conveyed a different joke, highlighting that adding `citation needed` note constitutes a passive-aggressive way of calling out someone for an unsubstantiated claim.

Later, in Randall munroe's ["what if"](https://what-if.xkcd.com/) blog as well as the [related books](https://xkcd.com/books/) he's written, he often includes [citation needed] under a different context:

![](/assets/references/inside-jokes/citation-needed-2.png)

Where he adds [citation needed] next to an obvious fact, as if it required some authoratative source or original research to back up the claim.

![](/assets/references/inside-jokes/citation-needed-1.png)

The meme adds irreverent humor when discussing topics that might otherwise actually require references, like this website or like Randall Munroe's other blog posts and book articles, which often are full of real world legitimate citations.

These images are the copyright of Randall Munroe [citation needed].

## Big Buck Bunny

Big Buck Bunny is a movie from the open source animation software [Blender](https://blender.org), as part of the [Peach Open Movie Project](https://peach.blender.org/about/).

Unlike most movies and videos, it was released under the Creative Commons 3.0 license which is highly permissive, enabling the movie to be distributed without worry about intellectual property concerns.

As such, it became used by video engineers to test video codecs, video playback and really all aspects of video technology. It's been used so much for this purpose that it has become a meme:

<iframe width="640" height="360" src="https://www.youtube.com/embed/KDDif85hiUg" title="Lightning Talk #1: Charles Sonigo - The Dark Truths of a Video Dev Cartoon" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="height: 360px;"></iframe>

As you can see in several of the demos in this repo itself [[1]](/demo/player/index.html)[[2]](/demo/transcoding/index.html)[[3]](/demo/web-audio/basic-playback.html), this guide follows video developer tradition by using big buck bunny in most of the demos.

I have worked on some form of video technology for over 10 years, including having patented a vector-based-video codec and encoded big buck bunny as a vector animation [[4](https://patents.google.com/patent/US10116963B1/en)][[5](https://www.youtube.com/watch?v=EvGA5qCfy9I)]. I have never personally watched more than ~60 seconds of Big Buck Bunny. I'll get to it at some point.

If you are interested in watching it, here is the full movie.

<video src="https://katana-misc-files.s3.us-east-1.amazonaws.com/videos/bbb-fixed.mp4" width="640" height="360" controls> </video>

If you do watch the whole thing, you can of course give it a rating on IMDB:  https://www.imdb.com/title/tt1254207/


## Rube Goldberg Machine

In the [VideoDecoder](../../basics/decoder), [VideoEncoder](../../basics/encoder) and [Transcoding](../../patterns/transcoding) I likened `VideoDecoder` and `VideoEncoder` objects to Rube Goldberg machines, as some type of complex mechanical machine.

![](/assets/basics/encoder/rube-goldberg-2.png)

In reality, Video Decoders and Video Encoders are actually complex as they encode/decode complex interframe depdencies [[6](../../basics/encoded-video-chunk/#presentation-order-versus-decode-order)], but that's hard to visualize, so I likened the encode/decode pipeline to a conveyer belt machine with complex mechanics as a visual metaphor.


Rube Goldberg machines are no less complex, but unlike video compression software, Rube Goldberg machines are both incredibly useless and super fun to watch. Here's an example:

<iframe width="640" height="360" style="height:360px" src="https://www.youtube.com/embed/pixh1vrogjE" title="Chain Reaction Rube Goldberg Machine - Guinness World Records" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

If you're struggling to wrap your head around [Discrete Cosine Transforms](https://www.youtube.com/watch?v=Q2aEzeMDHMA) and [B frames](https://en.wikipedia.org/wiki/Video_compression_picture_types), just imagine your decoder/encoder as a Rube Goldberg machine or marble run, and video frames as dominoes. It won't help you understand the tech, but at least it's fun to watch.