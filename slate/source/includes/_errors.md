# Errors

<aside class="notice">
This error section is stored in a separate file in <code>includes/_errors.md</code>. Slate allows you to optionally separate out your docs into many files...just save them to the <code>includes</code> folder and add them to the top of your <code>index.md</code>'s frontmatter. Files are included in the order listed.
</aside>

Altern8 Value uses the following error codes: (Returned as part of GraphQL response)


Error Code | Meaning
---------- | -------
401 | Access Denied -- User is not authorized to perform this operation.
404 | Not Found -- Requested object does not exist.
409 | Conflict -- Object already exists.
500 | Server Error -- Returned when Database error occured.
