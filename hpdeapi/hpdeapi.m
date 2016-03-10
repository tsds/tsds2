function D = hpdeapi(url, checkversion)

javaaddpath('http://central.maven.org/maven2/org/json/json/20140107/json-20140107.jar')
str = urlread('http://tsds.org/get/?catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=-P3D&stop=2014-08-17&return=dd');
j1 = org.json.JSONArray(str)
dd = j1.get(0)
j1.get(0).get('columnFillValues')


if (checkversion)
    % Check version of API that server is using.
    info = urlread('http://tsds.org/get/info');
    version = % Get from info string.
    if ~strcmp(version, '1') % Server is using another API version.
        latest = sprintf('hpdeapi%s.m',version); % Latest API version.
        com = sprintf('D = hpdeapi%s(url, 0)',version);
        if ~exist(latest, 2) % If latest API version not found locally.
            fprintf('Server requires an updated reader.  Downloading.\n');
            urlwrite(sprintf('http://tsds.org/get/scripts/%s',latest));
        end
        eval(com); % Evaluate e.g D = hpdeapi1(url,0) and return.
        return
    end
end

% Test version of MATLAB being used.

SVR = 'http://tsds.org/get';
QS  = 'catalog=SuperMAG/PT1M&dataset=AIA&parameters=B_N&start=2014-12-28&stop=2014-12-31&return=data&format=ascii-2';
url = [SVR,'?',QS];

fprintf('hdpeapi.m: Downloading %s\n',url);
Ds  = urlread(tmp);
D   = str2num(Ds);
L   = {'Year','Month','Day','Hour','Minute','Second','B North GEO [nT]'};

fprintf('tsdsfe.m: Data matrix D [%d,%d] has column labels: ',size(D,1),size(D,2));
tmp=sprintf('%s, ',L{:});fprintf('%s\n',tmp(1:end-2));
fprintf('tsdsfe.m: First timestamp: %s\n',datestr(D(1,1:6),31));
fprintf('tsdsfe.m: Last timestamp:  %s\n',datestr(D(end,1:6),31));