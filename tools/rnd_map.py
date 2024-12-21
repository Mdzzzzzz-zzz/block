import random
import math

def generate_matrix(oneCount):
    matrix = [[0] * 8 for _ in range(8)]
    count = 0
    
    while count < oneCount:
        row = random.randint(0, 7)
        col = random.randint(0, 3)
        
        if matrix[row][col] == 1 or matrix[row][7-col] == 1:
            continue
        
        matrix[row][col] = 1
        matrix[row][7-col] = 1
        count +=2
        
    return matrix
level = 1
maxLevel = 48
maxOneCount = 36
minOneCount = 8

while level<=maxLevel:
    oneCount = minOneCount + math.ceil((maxOneCount-minOneCount)*level/maxLevel)
    matrix = generate_matrix(oneCount)
    print("leve-",level,"-start-",oneCount)
    # 打印优化后的矩阵
    for row in range(len(matrix)):
        for col in range(len(matrix[0])):
            print(f"{matrix[row][col]} ", end="")
        print() # 换行以对齐下一行
    print("level-",level,"-end",oneCount)
    level+=1
    