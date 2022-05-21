module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('src/img/*.png');
  eleventyConfig.addPassthroughCopy('src/css/*.css');
  eleventyConfig.addPassthroughCopy('src/levels/*.txt');
  
  return {
    dir: {
      input: 'src',
      output: 'dist',
    },
  };
};
