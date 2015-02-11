; Enter the following commands at the IDL command line prompt.
; Data will be placed in matrix named D.
; Column labels will be placed in string array named L.

; __COMMENT__

SVR  = "__SERVER__"
QS   = "__QUERYSTRING__"

oUrl = OBJ_NEW('IDLnetUrl')
ds   = oUrl->Get(url=SVR+"?"+QS, /string_array )
D    = fltarr(size(ds,/DIMENSIONS),size(strsplit(ds[0]),/DIMENSIONS))
reads, ds, D

L        = ['Year','Month','Day','Hour','Minute','Second',__LABELS__]

help, D
print, 'has column labels'
print, L
