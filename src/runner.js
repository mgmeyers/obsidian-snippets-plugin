function runner(src, lang,
                {
                    python = 'python3 -c',
                } = {}) {
    console.log(src, lang)
    throw Error('implement me')
}

module.exports = runner;
