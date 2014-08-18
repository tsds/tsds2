; Enter the following commands at the IDL command line prompt.
; Data will be placed in matrix named D.
; Column labels will be placed in string array named L.

SVR  = "http://localhost:8004/"
QS   = "catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=-P3D&stop=2014-07-14&outformat=2"

oUrl = OBJ_NEW('IDLnetUrl')
ds   = oUrl->Get(url=SVR+"?"+QS, /string_array )
D    = fltarr(size(ds,/DIMENSIONS),size(strsplit(ds[0]),/DIMENSIONS))
reads, ds, D

L        = ['Year','Month','Day','Hour','Minute','Second','X_TOD [R_E]']

help, D
print, 'has column labels'
print, L
