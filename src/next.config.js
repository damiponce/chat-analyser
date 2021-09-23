/** @type {import('next').NextConfig} */
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
};
