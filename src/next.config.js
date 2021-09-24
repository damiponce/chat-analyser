/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
   reactStrictMode: true,

   webpack: (config, {isServer}) => {
      if (!isServer) {
         config.resolve.fallback.fs = false;
      }
      config.module.rules.push(
         {
            test: /\.(txt)$/i,
            use: 'raw-loader',
         },
         {
            test: /\.py/,
            type: 'asset/source',
         },
      );
      return config;
   },
   assetPrefix: isProd
      ? 'https://raw.githubusercontent.com/damiponce/chat-analyser/gh-pages/'
      : '',
};
