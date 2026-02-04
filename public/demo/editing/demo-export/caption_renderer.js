export class CaptionRenderer {
  constructor(transcript, ctx) {
    this.transcript = transcript;
    this.ctx = ctx;
    this.fontSize = 24;
    this.lineHeight = 32;
    this.lineGap = 8;
    this.wordGap = 12;
    this.maxLines = 2;
    this.maxWidth = 340; // For 360px portrait width, leave some padding

    // Create sentences from transcript
    this.sentences = this.createSentences();
  }

  createSentences() {
    const sentences = [];
    let currentSentence = null;
    let currentLine = null;

    // Flatten all words from transcript
    const allWords = [];
    for (const line of this.transcript) {
      for (const word of line.words) {
        allWords.push({
          text: word.word,
          start: word.start,
          end: word.end,
          speaker: line.speaker
        });
      }
    }

    for (const word of allWords) {
      // Measure word width
      word.width = this.ctx.measureText(word.text).width;

      if (!currentLine) {
        currentLine = {
          words: [word],
          width: word.width,
          start: word.start,
          end: word.end,
          speaker: word.speaker
        };
      } else if (
        word.width + this.wordGap + currentLine.width > this.maxWidth ||
        word.speaker !== currentLine.speaker
      ) {
        // Line is full or speaker changed - start new line
        if (!currentSentence) {
          currentSentence = {
            lines: [currentLine],
            start: currentLine.start,
            end: currentLine.end
          };
        } else if (currentSentence.lines.length >= this.maxLines) {
          // Sentence is full - push and start new
          sentences.push(currentSentence);
          currentSentence = {
            lines: [currentLine],
            start: currentLine.start,
            end: currentLine.end
          };
        } else {
          // Add line to current sentence
          currentSentence.lines.push(currentLine);
          currentSentence.end = currentLine.end;
        }

        // Start new line
        currentLine = {
          words: [word],
          width: word.width,
          start: word.start,
          end: word.end,
          speaker: word.speaker
        };
      } else {
        // Add word to current line
        currentLine.words.push(word);
        currentLine.width += this.wordGap + word.width;
        currentLine.end = word.end;
      }
    }

    // Push remaining line and sentence
    if (currentLine) {
      if (!currentSentence) {
        currentSentence = {
          lines: [currentLine],
          start: currentLine.start,
          end: currentLine.end
        };
      } else {
        currentSentence.lines.push(currentLine);
        currentSentence.end = currentLine.end;
      }
    }
    if (currentSentence) {
      sentences.push(currentSentence);
    }

    return sentences;
  }

  getCurrentSentence(time) {
    for (const sentence of this.sentences) {
      if (time >= sentence.start && time <= sentence.end) {
        return sentence;
      }
    }
    return null;
  }

  getCurrentWord(sentence, time) {
    for (const line of sentence.lines) {
      for (const word of line.words) {
        if (time >= word.start && time <= word.end) {
          return word;
        }
      }
    }
    return null;
  }

  draw(time) {
    const sentence = this.getCurrentSentence(time);
    if (!sentence) return;

    const currentWord = this.getCurrentWord(sentence, time);

    const canvasWidth = this.ctx.canvas.width;
    const canvasHeight = this.ctx.canvas.height;

    // Calculate total height for centering
    const totalHeight = sentence.lines.length * this.lineHeight +
                       (sentence.lines.length - 1) * this.lineGap;

    // Position captions near bottom (80% down)
    const startY = canvasHeight * 0.5 - totalHeight / 2;

    this.ctx.font = `700 ${this.fontSize}px Arial`;
    this.ctx.textBaseline = 'top';

    // Draw each line
    for (let i = 0; i < sentence.lines.length; i++) {
      const line = sentence.lines[i];
      const lineY = startY + i * (this.lineHeight + this.lineGap);

      // Center line horizontally
      const lineX = (canvasWidth - line.width) / 2;

      let wordX = lineX;

      // Draw each word
      for (const word of line.words) {
        const isCurrentWord = currentWord &&
                             word.start === currentWord.start &&
                             word.end === currentWord.end;

        if (isCurrentWord) {
          // Draw background box for current word
          const padding = 4;
          this.ctx.fillStyle = 'white';
          this.ctx.fillRect(
            wordX - padding,
            lineY - padding,
            word.width + padding * 2,
            this.lineHeight
          );

          // Draw black text
          this.ctx.fillStyle = 'black';
          this.ctx.fillText(word.text, wordX, lineY);
        } else {
          // Draw white text with black shadow
          this.ctx.shadowColor = 'black';
          this.ctx.shadowBlur = 4;
          this.ctx.shadowOffsetX = 2;
          this.ctx.shadowOffsetY = 2;

          this.ctx.fillStyle = 'white';
          this.ctx.fillText(word.text, wordX, lineY);

          // Reset shadow
          this.ctx.shadowColor = 'transparent';
          this.ctx.shadowBlur = 0;
          this.ctx.shadowOffsetX = 0;
          this.ctx.shadowOffsetY = 0;
        }

        wordX += word.width + this.wordGap;
      }
    }
  }
}
