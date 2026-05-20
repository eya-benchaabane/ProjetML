import typing
if not hasattr(typing, 'TResult'):
    typing.TResult = typing.TypeVar('TResult')

try:
    from evidently.report import Report
    print("Evidently imported successfully")
except Exception as e:
    import traceback
    traceback.print_exc()
