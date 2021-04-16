
This is a flowchart of the attachment process

[Mermaid][1] required to visualize

Or view online [here][2]

```mermaid
  graph TD
    BM[Watch add button mutatation] -->|event| CADD
    ERR[Send error]
    BM -->|timeout| ERR
    CADD[Click add button] --> DDM
    DDM[Watch mutation of the dropdown to select type of attachment] -->|event| CGD
    DDM -->|timeout| ERR
    CGD[Click button to add google drive attachment] --> PKM
    PKM[Watch mutation of picker] -->|event| GDPK
    PKM -->|timeout| ERR
    GDPK[Get data from the picker element] --> WPKRD
    WPKRD[Wait for picker script ready message] -->|message| SATTM
    WPKRD -->|timeout| ERR
    SATTM[Send attach message to picker script] --> WAM
    SATTM --> WECM
    WAM[Watch mutation of attachment item] -->|event| SCSS
    WAM -->|timeout| ERR
    WECM[Watch mutation of error card]
    WECM -->|event| ERR
    SCSS[Send success]
```

[1]: https://mermaid-js.github.io/mermaid/
[2]: https://mermaid-js.github.io/mermaid-live-editor/#/edit/eyJjb2RlIjoiZ3JhcGggVERcbiAgICBCTVtXYXRjaCBhZGQgYnV0dG9uIG11dGF0YXRpb25dIC0tPnxldmVudHwgQ0FERFxuICAgIEVSUltTZW5kIGVycm9yXVxuICAgIEJNIC0tPnx0aW1lb3V0fCBFUlJcbiAgICBDQUREW0NsaWNrIGFkZCBidXR0b25dIC0tPiBERE1cbiAgICBERE1bV2F0Y2ggbXV0YXRpb24gb2YgdGhlIGRyb3Bkb3duIHRvIHNlbGVjdCB0eXBlIG9mIGF0dGFjaG1lbnRdIC0tPnxldmVudHwgQ0dEXG4gICAgRERNIC0tPnx0aW1lb3V0fCBFUlJcbiAgICBDR0RbQ2xpY2sgYnV0dG9uIHRvIGFkZCBnb29nbGUgZHJpdmUgYXR0YWNobWVudF0gLS0-IFBLTVxuICAgIFBLTVtXYXRjaCBtdXRhdGlvbiBvZiBwaWNrZXJdIC0tPnxldmVudHwgR0RQS1xuICAgIFBLTSAtLT58dGltZW91dHwgRVJSXG4gICAgR0RQS1tHZXQgZGF0YSBmcm9tIHRoZSBwaWNrZXIgZWxlbWVudF0gLS0-IFdQS1JEXG4gICAgV1BLUkRbV2FpdCBmb3IgcGlja2VyIHNjcmlwdCByZWFkeSBtZXNzYWdlXSAtLT58bWVzc2FnZXwgU0FUVE1cbiAgICBXUEtSRCAtLT58dGltZW91dHwgRVJSXG4gICAgU0FUVE1bU2VuZCBhdHRhY2ggbWVzc2FnZSB0byBwaWNrZXIgc2NyaXB0XSAtLT4gV0FNXG4gICAgU0FUVE0gLS0-IFdFQ01cbiAgICBXQU1bV2F0Y2ggbXV0YXRpb24gb2YgYXR0YWNobWVudCBpdGVtXSAtLT58ZXZlbnR8IFNDU1NcbiAgICBXQU0gLS0-fHRpbWVvdXR8IEVSUlxuICAgIFdFQ01bV2F0Y2ggbXV0YXRpb24gb2YgZXJyb3IgY2FyZF1cbiAgICBXRUNNIC0tPnxldmVudHwgRVJSXG4gICAgU0NTU1tTZW5kIHN1Y2Nlc3NdIiwibWVybWFpZCI6eyJ0aGVtZSI6ImRlZmF1bHQifSwidXBkYXRlRWRpdG9yIjpmYWxzZX0