% Enter the following commands at the MATLAB/Octave command line prompt.
% Data will be placed in matrix named D and column labels in cell array L.
% __COMMENT__

if (0)
if ~exist('tsdsapi',2) % If script to read data is not found.
    fprintf('Downloading script to read data.\n');
    urlwrite('http://tsds.org/get/scripts/tsdsapi.m')
end
end

%url = [__SERVER__,'?',__QUERYSTRING__];

SVR = 'http://tsds.org/get/';
QS  = 'catalog=SuperMAG/PT1M&dataset=AIA&parameters=B_N&start=2014-12-28&stop=2014-12-31';
url = [SVR,'?',QS];

tsdsapi
%data = tsdsapi(url);
