%function D = tsdsapi(url, checkversion)

%if (nargin < 2)
    checkversion = 0;
%end

if (checkversion)
    % Check version of API that server is using.
    [version,status] = urlread('http://tsds.org/get/scripts/tsdsapi.m.version');
    if ~strcmp(version, '') % Newer script exists.
        latest = sprintf('hpdeapiv%s.m',version); % Latest API version.
        if ~exist(latest, 2) % If latest API version not found locally.
            fprintf('An updated version of tsdsapi.m exists.  Downloading.\n');
            urlwrite(sprintf('http://tsds.org/get/scripts/%s',latest));
        end
        com = sprintf('D = hpdeapiv%s(url, 0)',version);
        eval(com); % Evaluate e.g D = hpdeapi20170101(url,0) and return.
        return;
    end
end

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
urldd = sprintf('%s&return=dd',url);
fprintf('tsdsapi.m: Requesting %s\n',urldd);
ddstr = urlread(urldd);
fprintf('Done\n',urldd);
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
jar = 'http://central.maven.org/maven2/org/json/json/20140107/json-20140107.jar'
jarfound = 0;
jcp = javaclasspath('-dynamic');
for i = 1:length(jcp)
    if strcmp(jar,jcp{i})
        jarfound = 1;
        break;
    end
end
if (~jarfound)
    fprintf('tsdsapi.m: Adding JSON jar file to path.\n');
    javaaddpath(jar)
end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

L   = {'Year','Month','Day','Hour','Minute','Second'};

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
fprintf('tsdsapi.m: Parsing response.\n',urldd);
dd = org.json.JSONArray(ddstr);
for i = 0:dd.length-1
    u = dd.get(i).get('columnUnits');
    L{i+7} = dd.get(i).get('columnLabels');
    if (~strcmp(u,''))
        L{i+7} = sprintf('%s [%s]',L{i+7},u);
    end
end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

urldata = sprintf('%s&return=data&format=ascii-2',url);

fprintf('tsdsapi.m: Downloading data from %s\n',urldata);
Ds  = urlread(urldata);
D   = str2num(Ds);

dn = datenum(D(:,1:6));

plot(dn,D(:,7:end))
legend(L(7:end));
datetick('x')
fprintf('tsdsfe.m: Data matrix D [%d,%d] has column labels: ',size(D,1),size(D,2));
tmp=sprintf('%s, ',L{:});fprintf('%s\n',tmp(1:end-2));
fprintf('tsdsfe.m: First timestamp: %s\n',datestr(D(1,1:6),31));
fprintf('tsdsfe.m: Last timestamp:  %s\n',datestr(D(end,1:6),31));