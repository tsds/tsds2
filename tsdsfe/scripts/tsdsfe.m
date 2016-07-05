% Enter the following commands at the MATLAB/Octave command line prompt.
% Data will be placed in matrix named D and column labels in cell array L.
% __COMMENT__

SVR = '__SERVER__';
QS  = '__QUERYSTRING__';
tmp = [SVR,'?',QS];
fprintf('tsdsfe.m: Downloading %s\n',tmp);
[Ds,s]  = urlread(tmp); 
if (s == 0)
    fprintf('tsdsfe.m: Error when downloading.  Check server status at __STATUS__\n');
end
D   = str2num(Ds);
L   = {'Year','Month','Day','Hour','Minute','Second',__LABELS__};

fprintf('tsdsfe.m: Data matrix D [%d,%d] has column labels: ',size(D,1),size(D,2));
tmp = sprintf('%s, ',L{:});fprintf('%s\n',tmp(1:end-2));
fprintf('tsdsfe.m: First timestamp: %s\n',datestr(D(1,1:6),31));
fprintf('tsdsfe.m: Last timestamp:  %s\n',datestr(D(end,1:6),31));
