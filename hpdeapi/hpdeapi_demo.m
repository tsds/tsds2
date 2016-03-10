if ~exist('hpdeapi',2)
    fprintf('Downloading script to read data\n');
    urlwrite('http://tsds.org/get/scripts/hpdeapi.m')
end

SVR = 'http://tsds.org/get';
QS  = 'catalog=SuperMAG/PT1M&dataset=AIA&parameters=B_N&start=2014-12-28&stop=2014-12-31&return=data&format=ascii-2';
url = [SVR,'?',QS];

data = hpdeapi(url);
