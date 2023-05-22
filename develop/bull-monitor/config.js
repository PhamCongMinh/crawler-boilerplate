module.exports = {
    port: 3001,
    redis: {
        port: 6380,
        host: '0.0.0.0',
        password: '',
        tls: false,
    },
    username: 'nft',
    password: 'example',
    queues: ['CRAWL_PAIR_QUEUE'],
};
