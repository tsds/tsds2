% Enter the following commands at the MATLAB command line prompt.
% Data will be placed in matrix named D.
% Column labels will be placed in cell array named L.

SVR   = '__SERVER__';
QS    = '__QUERYSTRING__';

Ds = urlread([SVR,'?',QS]); % Read data
D  = str2num(Ds);

L  = {'Year','Month','Day','Hour','Minute','Second',__LABELS__};

whos D
fprintf('Data matrix D has column labels\n');
L

fprintf('tsdsfe.m: First timestamp: %s\n',datestr(D(1,1:6),31));
fprintf('tsdsfe.m: Second timestamp: %s\n',datestr(D(2,1:6),31));
fprintf('tsdsfe.m: Last timestamp: %s\n',datestr(D(end,1:6),31));
