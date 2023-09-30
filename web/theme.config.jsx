export default {
  logo: <span>Micro Batcher</span>,
  project: {
    link: 'https://github.com/JaysonGCS/micro-batcher'
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s | Micro Batcher'
    };
  },
  search: {
    placeholder: 'Search...'
  },
  nextThemes: {
    defaultTheme: 'dark'
  },
  toc: {
    float: true,
    backToTop: true
  },
  docsRepositoryBase: 'https://github.com/JaysonGCS/micro-batcher/tree/main/web',
  sidebar: {
    toggleButton: true,
    defaultMenuCollapseLevel: 1
  }
};
