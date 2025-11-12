#include <bits/stdc++.h>
using namespace std;

int main(){
    int t;
    cin >> t; 
    while(t--){
        int d;
        cin >> d;
        int i = 1;
        bool flag = true;
        while(flag){
            int s1 = 0;       
            int counter = 0;   
            for(int j = 1; j <= i; j++){
                if(i % j == 0){
                    if(s1 == 0){
                        s1 = j;
                    }
                    else{
                        if(j - s1 < d){
                            break;
                        }
                        else{ 
                            s1 = j;
                            if(counter < 4)
                                counter++;
                            else{
                                cout << i << endl;
                                flag = false;
                            }
                        }
                    }
                }
            }
            i++;
        }
    }
}
