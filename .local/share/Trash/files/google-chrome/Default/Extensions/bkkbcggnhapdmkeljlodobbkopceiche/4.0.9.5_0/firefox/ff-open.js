let redir = decodeURIComponent(location.search.substring(1).split('=')[1]);

location.href = redir;